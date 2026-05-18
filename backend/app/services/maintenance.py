import uuid
import asyncio
import logging
from sqlalchemy.orm import Session
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchAny, PointStruct
from langchain_groq import ChatGroq

from app.core.config import settings
from app.models.chatbot import ManualKnowledgeEntry, LearnedChat

logger = logging.getLogger(__name__)

LIVE_STATUS = {
    "is_running": False,
    "progress_message": "Idle",
    "clusters_merged": 0,
    "freed_space": 0,
    "current_merge_details": None
}

async def consolidate_similar_tickets(db: Session, qdrant: QdrantClient, embeddings) -> None:
    global LIVE_STATUS
    LIVE_STATUS["is_running"] = True
    LIVE_STATUS["clusters_merged"] = 0
    LIVE_STATUS["freed_space"] = 0
    LIVE_STATUS["current_merge_details"] = None

    SIMILARITY_THRESHOLD = 0.88  # Good balance for finding duplicates
    MIN_CLUSTER_SIZE = 2         # Merges even pairs
    collection = settings.QDRANT_COLLECTION # MAKE SURE THIS POINTS TO YOUR MAIN BRAIN IN .ENV!

    try:
        LIVE_STATUS["progress_message"] = f"Connecting to collection: {collection}..."
        
        processed_ids = set()
        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1, api_key=settings.GROQ_API_KEY)
        
        next_page_offset = None
        batch_number = 1

        # --- THE PAGINATION LOOP (Scans the entire database, 500 at a time) ---
        while True:
            LIVE_STATUS["progress_message"] = f"Scanning batch {batch_number} of vectors in Qdrant..."
            
            scroll_result = qdrant.scroll(
                collection_name=collection,
                limit=500,
                offset=next_page_offset,
                with_payload=True,
                with_vectors=True
            )
            
            points = scroll_result[0]
            next_page_offset = scroll_result[1]

            if not points:
                break # We reached the end of the database!

            for point in points:
                if str(point.id) in processed_ids:
                    continue

                # 2. Search for vectors highly similar to this one
                search_response = qdrant.query_points(
                    collection_name=collection,
                    query=point.vector,
                    limit=15,
                    score_threshold=SIMILARITY_THRESHOLD
                )
                
                search_results = search_response.points

                if len(search_results) >= MIN_CLUSTER_SIZE:
                    cluster_ids = [str(res.id) for res in search_results]
                    cluster_payloads = [res.payload.get("page_content", "No content") for res in search_results]
                    processed_ids.update(cluster_ids)

                    # Update Live Feed
                    LIVE_STATUS["progress_message"] = f"Merging cluster of {len(cluster_ids)} tickets..."
                    LIVE_STATUS["current_merge_details"] = {
                        "source_tickets": cluster_payloads,
                        "status": "Waiting for AI to generate Master Rule..."
                    }

                    # 3. Ask the LLM to merge them
                    combined_text = "\n\n---\n\n".join(cluster_payloads)
                    prompt = (
                        "You are an Expert IT Knowledge Base Editor. Read the following similar IT support tickets. "
                        "Merge them into a single, comprehensive 'Master Troubleshooting Guide'.\n"
                        "Extract the core issue, the common root cause, and the definitive resolution steps.\n"
                        "Output ONLY the finalized guide text. Do not use markdown blocks.\n\n"
                        f"TICKETS TO MERGE:\n{combined_text}"
                    )
                    
                    ai_response = await llm.ainvoke(prompt)
                    master_rule_content = ai_response.content.strip()

                    # Update Live Feed
                    LIVE_STATUS["current_merge_details"]["status"] = "Master Rule Generated!"
                    LIVE_STATUS["current_merge_details"]["master_rule"] = master_rule_content
                    await asyncio.sleep(2) # Give admin time to read the UI

                    # 4. Save to SQL
                    master_title = f"AI Master Rule: Consolidated {len(cluster_ids)} similar tickets"
                    new_rule = ManualKnowledgeEntry(
                        Title=master_title,
                        Category="General_IT",
                        Content=master_rule_content,
                        IsActive=True
                    )
                    db.add(new_rule)
                    db.commit()
                    db.refresh(new_rule)

                    # 5. Push to Qdrant
                    master_vector = await asyncio.to_thread(embeddings.embed_query, master_rule_content)
                    qdrant.upsert(
                        collection_name=collection,
                        points=[PointStruct(
                            id=str(new_rule.EntryID),
                            vector=master_vector,
                            payload={
                                "page_content": f"TITLE: {master_title}\nCONTENT: {master_rule_content}",
                                "metadata": {
                                    "document_id": new_rule.EntryID,
                                    "source": master_title,
                                    "category": "General_IT",
                                    "doc_type": "general_text"
                                }
                            }
                        )]
                    )

                    # 6. Delete old duplicates from SQL and Qdrant
                    db.query(LearnedChat).filter(LearnedChat.SessionID.in_(cluster_ids)).update({"IsActive": False}, synchronize_session=False)
                    db.commit()
                    
                    qdrant.delete(collection_name=collection, points_selector=cluster_ids)

                    LIVE_STATUS["clusters_merged"] += 1
                    LIVE_STATUS["freed_space"] += len(cluster_ids)

            # If there is no next page, we are done
            if next_page_offset is None:
                break
                
            batch_number += 1

        if LIVE_STATUS["clusters_merged"] == 0:
            LIVE_STATUS["progress_message"] = "Qdrant is clean. No duplicated tickets found."
        else:
            LIVE_STATUS["progress_message"] = "Optimization Complete!"

    except Exception as e:
        logger.error(f"Consolidation failed: {e}", exc_info=True)
        LIVE_STATUS["progress_message"] = f"Error during consolidation: {str(e)}"
    finally:
        LIVE_STATUS["is_running"] = False