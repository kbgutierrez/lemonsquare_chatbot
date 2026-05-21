"""
Knowledge consolidation background task.
Deduplicates similar tickets via LLM and merges into Master Rules.
Previously duplicated in maintenance.py (two identical copies existed).
"""
import asyncio
import logging
from qdrant_client.http.models import PointStruct
from app.core.config import settings
from app.services.llm_client import create_llm
from app.services.prompts import build_consolidation_prompt

logger = logging.getLogger(__name__)

LIVE_STATUS = {
    "is_running": False,
    "progress_message": "Idle",
    "clusters_merged": 0,
    "freed_space": 0,
    "current_merge_details": None
}

SIMILARITY_THRESHOLD = 0.88
MIN_CLUSTER_SIZE = 2


async def consolidate_similar_tickets(db, qdrant, embeddings) -> None:
    """
    Background task: Find clusters of similar tickets, merge via LLM,
    save as Master Rules, delete duplicates.
    """
    global LIVE_STATUS
    LIVE_STATUS["is_running"] = True
    LIVE_STATUS["clusters_merged"] = 0
    LIVE_STATUS["freed_space"] = 0
    LIVE_STATUS["current_merge_details"] = None

    collection = settings.QDRANT_COLLECTION

    try:
        LIVE_STATUS["progress_message"] = f"Connecting to collection: {collection}..."
        processed_ids = set()
        llm = create_llm(model="llama-3.1-8b-instant", temperature=0.1)
        next_page_offset = None
        batch_number = 1

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
                break

            for point in points:
                if str(point.id) in processed_ids:
                    continue

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

                    LIVE_STATUS["progress_message"] = f"Merging cluster of {len(cluster_ids)} tickets..."
                    LIVE_STATUS["current_merge_details"] = {
                        "source_tickets": cluster_payloads,
                        "status": "Waiting for AI to generate Master Rule..."
                    }

                    # Merge via LLM
                    prompt = build_consolidation_prompt(cluster_payloads)
                    ai_response = await llm.ainvoke(prompt)
                    master_rule_content = ai_response.content.strip()

                    LIVE_STATUS["current_merge_details"]["status"] = "Master Rule Generated!"
                    LIVE_STATUS["current_merge_details"]["master_rule"] = master_rule_content
                    await asyncio.sleep(2)

                    # Save to SQL
                    from app.models.chatbot import ManualKnowledgeEntry
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

                    # Push to Qdrant
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

                    # Deactivate old duplicates
                    db.query(ManualKnowledgeEntry).filter(
                        ManualKnowledgeEntry.EntryID.in_(cluster_ids)
                    ).update({"IsActive": False}, synchronize_session=False)
                    db.commit()
                    qdrant.delete(collection_name=collection, points_selector=cluster_ids)

                    LIVE_STATUS["clusters_merged"] += 1
                    LIVE_STATUS["freed_space"] += len(cluster_ids)

            if next_page_offset is None:
                break
            batch_number += 1

        if LIVE_STATUS["clusters_merged"] == 0:
            LIVE_STATUS["progress_message"] = "Qdrant is clean. No duplicated tickets found."
        else:
            LIVE_STATUS["progress_message"] = "Optimization Complete!"

    except Exception as e:
        logger.error("Consolidation failed: %s", e, exc_info=True)
        LIVE_STATUS["progress_message"] = f"Error during consolidation: {str(e)}"
    finally:
        LIVE_STATUS["is_running"] = False
