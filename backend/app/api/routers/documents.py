"""
Document management endpoints.

Previously these routes lived in main.py alongside ticket and settings
endpoints. Extracting each feature into its own router module means:
  - main.py stays under 50 lines.
  - This file can be reviewed, tested, and modified in isolation.
  - Adding document features (e.g. re-categorise, preview) is self-contained.
"""

import asyncio
import logging
import uuid
from qdrant_client.http.models import PointStruct

from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from qdrant_client.http import models as qdrant_models
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_ingestion_service, get_orchestrator
from app.models.chatbot import UploadedDocument
from app.schemas.documents import (
    DocumentDeleteResponse,
    DocumentResponse,
    DocumentUploadResponse,
    ManualEntryRequest,
    
)

from app.services.ingestion_service import DocumentIngestionService
from app.services.orchestrator import SupportOrchestrator


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    summary="Upload and ingest a PDF document",
)
async def upload_document(
    file: UploadFile = File(...),
    category: str | None = Form(None),
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> DocumentUploadResponse:
    """
    Upload a PDF, categorise it (Admin-provided or AI auto-guessed), embed and store in Qdrant,
    and save metadata to SQL.

    File validation (PDF magic bytes) is handled inside the service.
    The category must be one of the allowed categories from AIChatbotSettings.
    """
    result = await ingestion_service.process_pdf_upload(file, db, manual_category=category)
    return DocumentUploadResponse(**result)


class VectorSearchRequest(BaseModel):
    query: str
    limit: int = 5


@router.post(
    "/test-search",
    tags=["Documents", "Admin"],
    summary="Admin tool to inspect Qdrant search results",
)
async def test_vector_search(
    request: VectorSearchRequest,
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
):
    """Admin tool to see EXACTLY what Qdrant returns for a given search query."""
    vector = await asyncio.to_thread(
        ingestion_service.embeddings.embed_query, request.query
    )

    results = ingestion_service.qdrant.query_points(
        collection_name=ingestion_service.collection_name,
        query=vector,
        with_payload=True,
        limit=request.limit,
    )

@router.post("/debug/full-pipeline", tags=["Documents", "Admin"])
async def debug_full_rag_pipeline(
    request: VectorSearchRequest,
    orchestrator: SupportOrchestrator = Depends(get_orchestrator),
    db: Session = Depends(get_chatbot_db),
):
    """
    Debug the complete RAG pipeline: Query → Reformulation → Retrieval → Answer
    Returns detailed debug info without saving anything.
    """
    # Use empty chat history for debug
    chat_history = ""
    user_name = "Debug User"
    
    debug_result = await orchestrator.debug_orchestrate(
        user_query=request.query,
        chat_history=chat_history,
        user_name=user_name,
        db=db,
    )
    
    # Format the response for the frontend
    return {
        "original_query": debug_result["original_query"],
        "reformulated_query": debug_result["reformulated_query"],
        "retrieval_results": {
            "tickets": [
                r for r in debug_result["retrieval_results"] 
                if r["type"] != "uploaded_manual"
            ],
            "documents": [
                r for r in debug_result["retrieval_results"] 
                if r["type"] == "uploaded_manual"
            ]
        },
        "final_answer": debug_result["final_answer"],
        "raw_debug": {
            "ticket_ids_used": debug_result.get("ticket_ids_used", []),
            "total_retrieval_count": len(debug_result["retrieval_results"])
        }
    }





@router.get(
    "",
    response_model=list[DocumentResponse],
    summary="List uploaded documents",
)
def get_documents(
    category: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_chatbot_db),
) -> list[DocumentResponse]:
    """
    Fetch active uploaded documents, optionally filtered by category.
    """
    query = db.query(UploadedDocument).filter(UploadedDocument.IsActive == True)
    if category:
        query = query.filter(UploadedDocument.Category == category)

    documents = (
        query.order_by(UploadedDocument.UploadedAt.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        DocumentResponse(
            document_id=doc.DocumentID,
            file_name=doc.FileName,
            category=doc.Category,
            chunk_count=doc.ChunkCount,
            uploaded_at=doc.UploadedAt,
        )
        for doc in documents
    ]


@router.delete(
    "/{document_id}",
    response_model=DocumentDeleteResponse,
    summary="Delete a document from the knowledge base",
)
async def delete_document(
    document_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> DocumentDeleteResponse:
    """
    Remove a document's vectors from Qdrant and its metadata from SQL.
    """
    result = await ingestion_service.delete_document(document_id, db)
    return DocumentDeleteResponse(**result)


class DocTypeFilterRequest(BaseModel):
    doc_type: str | None = None  # None = all, otherwise: "resolved_chat", "helpdesk_ticket", "official_document", "general_text"
    limit: int = 100
    skip: int = 0


@router.post(
    "/explore/by-type",
    tags=["Documents", "Admin"],
    summary="Filter knowledge base by doc_type for the Admin Explorer",
)
async def explore_by_doc_type(
    request: DocTypeFilterRequest,
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
):
    """
    Enterprise Admin tool: Query the knowledge base by source/type.
    Returns all chunks for a given doc_type with their metadata.
    
    doc_type values:
    - "resolved_chat": AI-extracted from resolved chats
    - "helpdesk_ticket": From IT helpdesk webhook sync
    - "official_document": Uploaded PDF manuals
    - "general_text": Manual KB entries typed into admin dashboard
    - None: All knowledge base entries
    """
    
    # Build the Qdrant filter
    query_filter = None
    if request.doc_type:
        query_filter = qdrant_models.Filter(
            must=[
                qdrant_models.FieldCondition(
                    key="metadata.doc_type",
                    match=qdrant_models.MatchValue(value=request.doc_type)
                )
            ]
        )
    
    # Query Qdrant with the filter
    results = ingestion_service.qdrant.scroll(
        collection_name=ingestion_service.collection_name,
        limit=request.limit,
        offset=request.skip,
        query_filter=query_filter,
        with_payload=True,
    )
    
    # Format results for the frontend
    points = results[0] if results else []
    formatted_results = []
    
    for point in points:
        payload = point.payload or {}
        metadata = payload.get("metadata", {})
        formatted_results.append({
            "id": point.id,
            "doc_type": metadata.get("doc_type", "unknown"),
            "title": metadata.get("title", "Untitled"),
            "content": metadata.get("content", ""),
            "source": metadata.get("source", "unknown"),
            "page": metadata.get("page", None),
            "timestamp": metadata.get("timestamp", None),
        })
    
    return {
        "total_count": len(formatted_results),
        "doc_type_filter": request.doc_type,
        "results": formatted_results,
    }


@router.post("/manual", summary="Add manual text to KB")
async def add_manual_knowledge(
    request: ManualEntryRequest,
    db: Session = Depends(get_chatbot_db), # <--- We need the DB for the category check
    ingestion_service = Depends(get_ingestion_service)
):
    """Embeds raw text into Qdrant, auto-categorizing if necessary."""
    
    # Hand the data over to the service!
    result = await ingestion_service.process_manual_entry(
        title=request.title,
        content=request.content,
        manual_category=request.category,
        db=db
    )
    
    return result



