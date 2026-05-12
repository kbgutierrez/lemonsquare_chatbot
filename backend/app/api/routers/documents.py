"""
Document management endpoints.

Previously these routes lived in main.py alongside ticket and settings
endpoints. Extracting each feature into its own router module means:
  - main.py stays under 50 lines.
  - This file can be reviewed, tested, and modified in isolation.
  - Adding document features (e.g. re-categorise, preview) is self-contained.
"""

import logging

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_ingestion_service
from app.models.chatbot import UploadedDocument
from app.schemas.documents import (
    DocumentDeleteResponse,
    DocumentResponse,
    DocumentUploadResponse,
)
from app.services.ingestion_service import DocumentIngestionService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    summary="Upload and ingest a PDF document",
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> DocumentUploadResponse:
    """
    Upload a PDF, auto-categorise it via LLM, embed and store in Qdrant,
    and save metadata to SQL.

    File validation (PDF magic bytes) is handled inside the service.
    """
    result = await ingestion_service.process_pdf_upload(file, db)
    return DocumentUploadResponse(**result)


@router.get(
    "",
    response_model=list[DocumentResponse],
    summary="List uploaded documents",
)
def get_documents(
    category: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_chatbot_db),
) -> list[DocumentResponse]:
    """
    Fetch active uploaded documents, optionally filtered by category.
    """
    query = db.query(UploadedDocument).filter(UploadedDocument.IsActive == True)
    if category:
        query = query.filter(UploadedDocument.Category == category)

    documents = query.order_by(UploadedDocument.UploadedAt.desc()).limit(limit).all()

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
