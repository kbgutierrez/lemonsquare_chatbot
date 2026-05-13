"""
Knowledge Base Explorer endpoints.

Directly queries Qdrant to show what the AI has learned.
Bypasses SQL entirely and pulls raw metadata from the vector database.
"""

import logging
from fastapi import APIRouter, Depends
from qdrant_client.http import models as qdrant_models

from app.api.deps import get_ingestion_service
from app.schemas.knowledge import KnowledgeExplorerResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge", tags=["Explorer"])


@router.get(
    "/explore",
    response_model=list[KnowledgeExplorerResponse],
    summary="Browse Qdrant Knowledge Base"
)
async def explore_knowledge_base(
    doc_type: str | None = None,
    limit: int = 50,
    ingestion_service = Depends(get_ingestion_service)
):
    """
    Directly queries the Qdrant database to show what the AI currently knows.
    Skips SQL entirely and browses raw vector database metadata.
    
    Query Parameters:
    - doc_type: Filter by knowledge source type
      - "resolved_chat": AI-extracted from resolved chats
      - "helpdesk_ticket": From IT helpdesk webhook sync
      - "official_document": Uploaded PDF manuals
      - "general_text": Manual KB entries typed into admin dashboard
      - None/omitted: All knowledge base entries
    - limit: Max entries to return (default 50)
    
    Example URLs:
    - GET /knowledge/explore?doc_type=resolved_chat&limit=100
    - GET /knowledge/explore?doc_type=general_text
    - GET /knowledge/explore (all entries)
    """
    
    # 1. Build the Qdrant filter if a specific type is requested
    query_filter = None
    if doc_type:
        query_filter = qdrant_models.Filter(
            must=[
                qdrant_models.FieldCondition(
                    key="metadata.doc_type",
                    match=qdrant_models.MatchValue(value=doc_type)
                )
            ]
        )

    # 2. Use Qdrant's 'scroll' method to paginate through raw metadata
    # (scroll is designed for browsing, not vector similarity)
    scroll_result, _ = ingestion_service.qdrant.scroll(
        collection_name=ingestion_service.collection_name,
        scroll_filter=query_filter,
        limit=limit,
        with_payload=True,   # We want the metadata!
        with_vectors=False   # We don't need the vector arrays for the UI
    )

    # 3. Format the raw Qdrant points into our clean response schema
    results = []
    for point in scroll_result:
        payload = point.payload or {}
        metadata = payload.get("metadata", {})
        
        results.append(
            KnowledgeExplorerResponse(
                id=str(point.id),
                doc_type=metadata.get("doc_type", "unknown"),
                source=metadata.get("source", "System Extracted"),
                category=metadata.get("category", "Uncategorized"),
                # For resolved chats: page_content is the JSON string
                # For manuals/tickets: page_content is raw text
                content=payload.get("page_content", "")
            )
        )

    return results
