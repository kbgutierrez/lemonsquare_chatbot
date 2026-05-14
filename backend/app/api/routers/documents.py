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
from app.models.chatbot import UploadedDocument, ManualKnowledgeEntry
from app.schemas.documents import (
    DocumentDeleteResponse,
    DocumentResponse,
    DocumentUploadResponse,
    ManualEntryRequest,
    DocumentUpdateRequest,
    ManualEntryResponse,
    ManualEntryUpdateRequest,
    
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


@router.post("/manual", summary="Add manual text to KB")
async def add_manual_knowledge(
    request: ManualEntryRequest,
    db: Session = Depends(get_chatbot_db), 
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



@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Update a document's metadata",
)
async def update_document_metadata(
    document_id: str,
    request: DocumentUpdateRequest,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> DocumentResponse:
    from fastapi import HTTPException
    from app.models.chatbot import UploadedDocument
    
    try:
        # Pass the updates to the service
        await ingestion_service.update_document(document_id, request.model_dump(exclude_unset=True), db)
        
        # Fetch the fresh data
        updated_doc = db.query(UploadedDocument).filter(UploadedDocument.DocumentID == document_id).first()
        
        # THE FIX: Manually map the PascalCase SQL columns to the snake_case Pydantic schema
        return DocumentResponse(
            document_id=updated_doc.DocumentID,
            file_name=updated_doc.FileName,
            category=updated_doc.Category,
            chunk_count=updated_doc.ChunkCount,
            uploaded_at=updated_doc.UploadedAt,
        )
        
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    

@router.get("/manual", response_model=list[ManualEntryResponse], summary="List all manual rules")
def get_manual_entries(
    skip: int = 0, limit: int = 50, db: Session = Depends(get_chatbot_db)
):
    """Fetch manual entries securely from SQL instead of Qdrant."""
    entries = db.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.IsActive == True).order_by(ManualKnowledgeEntry.CreatedAt.desc()).offset(skip).limit(limit).all()
    return entries

@router.put("/manual/{entry_id}", summary="Update a manual rule")
async def update_manual_knowledge(
    entry_id: str,
    request: ManualEntryUpdateRequest,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service)
):
    from fastapi import HTTPException
    try:
        result = await ingestion_service.update_manual_entry(entry_id, request.model_dump(exclude_unset=True), db)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.delete("/manual/{entry_id}", summary="Delete a manual rule")
async def delete_manual_knowledge(
    entry_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service)
):
    result = await ingestion_service.delete_manual_entry(entry_id, db)
    return result



