from fastapi import APIRouter, Depends, Query
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from app.api.deps import get_ingestion_service
from app.schemas.self_knowledge import AIKnowledgeItem

router = APIRouter(prefix="/self_knowledge", tags=["AI Knowledge"])

@router.get("", response_model=list[AIKnowledgeItem], summary="Get AI-Learned Chats & Manual Rules")
async def get_ai_knowledge(
    # Allow the frontend to request just one type, or default to "both"
    filter_type: str = Query("both", description="Options: 'both', 'resolved_chat', 'general_text'"),
    limit: int = 50,
    ingestion_service = Depends(get_ingestion_service)
):
    """
    Fetches the knowledge the AI has generated itself (Resolved Chats) 
    and the quick rules manually typed by the Admin (General Text).
    Skips uploaded PDFs and Helpdesk Tickets entirely.
    """
    # 1. Build the specific Qdrant filter
    conditions = []
    
    if filter_type not in ["both", "resolved_chat", "general_text"]:
        filter_type = "both"

    if filter_type in ["both", "resolved_chat"]:
        conditions.append(
            FieldCondition(key="metadata.doc_type", match=MatchValue(value="resolved_chat"))
        )
        
    if filter_type in ["both", "general_text"]:
        conditions.append(
            FieldCondition(key="metadata.doc_type", match=MatchValue(value="general_text"))
        )

    # Use 'should' which acts as an OR operator.
    # It MUST be one of these conditions, locking out PDFs/Tickets.
    query_filter = Filter(should=conditions)

    # 2. Scroll Qdrant directly for the metadata
    scroll_result, _ = ingestion_service.qdrant.scroll(
        collection_name=ingestion_service.collection_name,
        scroll_filter=query_filter,
        limit=limit,
        with_payload=True,
        with_vectors=False,  # We don't need the heavy mathematical arrays here
    )

    # 3. Format perfectly for the frontend
    results = []
    for point in scroll_result:
        payload = point.payload or {}
        metadata = payload.get("metadata", {})
        
        results.append({
            "id": str(point.id),
            "doc_type": metadata.get("doc_type", "unknown"),
            "source": metadata.get("source", "AI Extracted"),
            "category": metadata.get("category", "Uncategorized"),
            "content": payload.get("page_content", "") 
        })

    return results