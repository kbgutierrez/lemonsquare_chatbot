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
import tempfile
import aiofiles
import os

from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import (
    get_chatbot_db,
    get_ingestion_service,
    get_orchestrator,
    require_admin_user,
    get_display_name
)
from app.core.rate_limit import limiter
from app.core.config import settings
from app.models.chatbot import UploadedDocument, ManualKnowledgeEntry
from app.core.metadata_contract import DOCUMENT_DOC_TYPES, TICKET_LIKE_DOC_TYPES
from app.schemas.documents import (
    DocumentDeleteResponse,
    DocumentResponse,
    DocumentUploadResponse,
    ManualEntryRequest,
    DocumentUpdateRequest,
    ManualEntryResponse,
    ManualEntryUpdateRequest,
)

from app.services.ingestion.ingestion_service import DocumentIngestionService
from app.services.rag.support_orchestrator import SupportOrchestrator
from app.services.maintenance.job_manager import job_manager
from app.utils.json_utils import format_utc_iso, to_utc_aware


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])
_upload_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_UPLOADS)


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    summary="Upload and ingest a PDF document",
)
@limiter.limit("10/minute")
async def upload_document(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    category: str | None = Form(None),
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> DocumentUploadResponse:
    """
    Upload a PDF, categorise it (Admin-provided or AI auto-guessed), embed and store in Qdrant,
    and save metadata to SQL.
    """
    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)
    max_upload_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    content_length = request.headers.get("content-length")
    if (
        content_length
        and content_length.isdigit()
        and int(content_length) > max_upload_bytes + (1024 * 1024)
    ):
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.MAX_UPLOAD_MB}MB upload limit.",
        )

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    is_tabular = ext in [".csv", ".xlsx", ".xls"]
    is_pdf = ext == ".pdf"

    if not is_pdf and not is_tabular:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only PDF, CSV, and Excel files are supported."
        )

    existing_doc = db.query(UploadedDocument).filter(UploadedDocument.FileName == filename).first()
    if existing_doc:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' already exists in the database."
        )

    job_id = job_manager.create_job(f"upload_{filename}")

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    temp_file_path = tmp_file.name
    tmp_file.close()

    try:
        total_size = 0
        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            while content := await file.read(1024 * 1024):
                total_size += len(content)
                if total_size > max_upload_bytes:
                    raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_MB}MB upload limit.")
                await out_file.write(content)
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        job_manager.update_job(job_id, status="failed", error=str(e), message="File upload failed")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")

    async def process_document_in_background():
        from app.core.database import SessionChatbot

        async with _upload_semaphore:
            job_manager.update_job(job_id, status="running", message=f"Processing {ext.upper()}...", progress=10.0)

            bg_db = SessionChatbot()

            try:
                bg_ingestion_service = DocumentIngestionService(db=bg_db)

                if is_pdf:
                    result = await asyncio.wait_for(
                        bg_ingestion_service.process_pdf_upload(
                            file=None,
                            db=bg_db,
                            manual_category=category,
                            job_id=job_id,
                            file_path=temp_file_path,
                            original_filename=filename,
                            acting_user_id=user_id,
                            acting_username=username
                        ),
                        timeout=settings.UPLOAD_PROCESS_TIMEOUT_SECONDS,
                    )
                else:
                    result = await asyncio.wait_for(
                        bg_ingestion_service.process_tabular_upload(
                            db=bg_db,
                            manual_category=category,
                            job_id=job_id,
                            file_path=temp_file_path,
                            original_filename=filename,
                            acting_user_id=user_id,
                            acting_username=username
                        ),
                        timeout=settings.UPLOAD_PROCESS_TIMEOUT_SECONDS,
                    )

                logger.info(
                    "Background upload completed for %s",
                    filename,
                )
                
                job_manager.update_job(job_id, status="completed", progress=100.0, message="Upload completed", details=result)

            except asyncio.TimeoutError:
                logger.error(
                    "Background upload timed out for %s after %s seconds",
                    filename,
                    settings.UPLOAD_PROCESS_TIMEOUT_SECONDS,
                )
                job_manager.update_job(
                    job_id,
                    status="failed",
                    error="Upload processing timed out.",
                    message="Upload timed out",
                )

            except Exception as e:
                logger.error(
                    "Background upload failed for %s: %s",
                    filename,
                    e,
                )
                job_manager.update_job(job_id, status="failed", error=str(e), message="Upload failed")

            finally:
                bg_db.close()

    background_tasks.add_task(
        process_document_in_background
    )

    return DocumentUploadResponse(
        status="processing",
        document_id="pending",
        category=category or "pending",
        chunks_processed=0,
        job_id=job_id,
    )


@router.get("/upload/status/{job_id}", tags=["Documents"])
async def get_upload_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


class VectorSearchRequest(BaseModel):
    query: str
    limit: int = 5


@router.post("/debug/full-pipeline", tags=["Documents", "Admin"])
async def debug_full_rag_pipeline(
    request: VectorSearchRequest,
    current_user: dict = Depends(require_admin_user),
    orchestrator: SupportOrchestrator = Depends(get_orchestrator),
    db: Session = Depends(get_chatbot_db),
):
    """
    Debug the complete RAG pipeline: Query → Reformulation → Retrieval → Answer
    Returns detailed debug info without saving anything.
    """
    chat_history = ""
    user_name = "Debug User"

    debug_result = await orchestrator.debug_orchestrate(
        session_id="",
        user_query=request.query,
        chat_history=chat_history,
        user_name=user_name,
        db=db,
        limit=request.limit,
    )

    return {
        "original_query": debug_result["original_query"],
        "reformulated_query": debug_result["reformulated_query"],
        "retrieval_results": {
            "tickets": [
                r for r in debug_result["retrieval_results"]
                if r.get("type") in TICKET_LIKE_DOC_TYPES
            ],
            "documents": [
                r for r in debug_result["retrieval_results"]
                if r.get("type") in DOCUMENT_DOC_TYPES
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
    status: str = "active",
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_chatbot_db),
) -> list[DocumentResponse]:
    """
    Fetch uploaded documents filtered by lifecycle status.

    status:
      - active
      - inactive
      - all
    """

    query = db.query(UploadedDocument)

    normalized_status = status.lower().strip()

    if normalized_status == "active":
        query = query.filter(
            UploadedDocument.IsActive == True
        )

    elif normalized_status == "inactive":
        query = query.filter(
            UploadedDocument.IsActive == False
        )

    if category:
        query = query.filter(
            UploadedDocument.Category == category
        )

    documents = (
        query.order_by(
            UploadedDocument.UploadedAt.desc()
        )
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
            uploaded_at=format_utc_iso(doc.UploadedAt),
            is_active=bool(doc.IsActive),
            uploaded_by=doc.UploadedBy,
            uploaded_by_username=doc.UploadedByUsername,
            updated_at=format_utc_iso(doc.UpdatedAt),
            updated_by=doc.UpdatedBy,
            updated_by_username=doc.UpdatedByUsername,
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
    current_user: dict = Depends(require_admin_user),
) -> DocumentDeleteResponse:
    """
    Soft-delete a document:
      - SQL -> IsActive=False
      - Qdrant -> metadata.is_active=False
    """
    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)

    result = await ingestion_service.delete_document(
        document_id,
        db,
        acting_user_id=user_id,
        acting_username=username,
    )

    return DocumentDeleteResponse(
        status=result.get("status", "success"),
        document_id=document_id,
    )


from app.services.retrieval.vector_store import get_shared_vector_store

@router.delete("/hard/{document_id}", tags=["Documents", "Admin"])
async def hard_delete_document_api(
    document_id: str,
    db: Session = Depends(get_chatbot_db),
    current_user: dict = Depends(require_admin_user),
    vector_store = Depends(get_shared_vector_store)
):
    from app.repositories.document_repository import DocumentRepository
    repo = DocumentRepository(db)

    # 1. Source of Truth Wipe
    deleted = repo.hard_delete_document(document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found in SQL.")

    # 2. Vector Wipe
    try:
        vector_store.hard_delete_by_source_id(document_id)
    except Exception as e:
        logger.error(f"SQL deleted but Qdrant failed for {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Document wiped from SQL, but Vector wipe failed.")

    return {"status": "success", "message": f"Document {document_id} permanently deleted."}


@router.delete("/manual/hard/{entry_id}", tags=["Documents", "Admin"])
async def hard_delete_manual_api(
    entry_id: str,
    db: Session = Depends(get_chatbot_db),
    current_user: dict = Depends(require_admin_user),
    vector_store = Depends(get_shared_vector_store)
):
    from app.repositories.document_repository import DocumentRepository
    repo = DocumentRepository(db)

    # 1. Source of Truth Wipe
    deleted = repo.hard_delete_manual_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Manual entry not found in SQL.")

    # 2. Vector Wipe
    try:
        vector_store.hard_delete_by_source_id(entry_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="SQL wiped, but Qdrant wipe failed.")

    return {"status": "success", "message": f"Manual rule {entry_id} permanently deleted."}


@router.post(
    "/{document_id}/restore",
    response_model=DocumentDeleteResponse,
    summary="Restore a deleted document to the knowledge base",
)
async def restore_document(
    document_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
    current_user: dict = Depends(require_admin_user),
) -> DocumentDeleteResponse:

    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)

    try:
        result = await ingestion_service.restore_document(
            document_id,
            db,
            acting_user_id=user_id,
            acting_username=username,
        )

        return DocumentDeleteResponse(
            status=result.get("status", "success"),
            document_id=document_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.post("/manual", summary="Add manual text to KB")
async def add_manual_knowledge(
    request: ManualEntryRequest,
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
    ingestion_service=Depends(get_ingestion_service)
):
    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)
    result = await ingestion_service.process_manual_entry(
        title=request.title,
        content=request.content,
        manual_category=request.category,
        db=db,
        acting_user_id=user_id,
        acting_username=username
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
    current_user: dict = Depends(require_admin_user),
) -> DocumentResponse:

    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)

    try:
        await ingestion_service.update_document(
            document_id,
            request.model_dump(exclude_unset=True),
            db,
            acting_user_id=user_id,
            acting_username=username,
        )

        updated_doc = (
            db.query(UploadedDocument)
            .filter(
                UploadedDocument.DocumentID == document_id
            )
            .first()
        )

        return DocumentResponse(
            document_id=updated_doc.DocumentID,
            file_name=updated_doc.FileName,
            category=updated_doc.Category,
            chunk_count=updated_doc.ChunkCount,
            uploaded_at=format_utc_iso(updated_doc.UploadedAt),
            is_active=bool(updated_doc.IsActive),
            uploaded_by=updated_doc.UploadedBy,
            uploaded_by_username=updated_doc.UploadedByUsername,
            updated_at=format_utc_iso(updated_doc.UpdatedAt),
            updated_by=updated_doc.UpdatedBy,
            updated_by_username=updated_doc.UpdatedByUsername,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get(
    "/manual",
    response_model=list[ManualEntryResponse],
    summary="List all manual rules",
)
def get_manual_entries(
    skip: int = 0,
    limit: int = 50,
    status: str = "all",
    db: Session = Depends(get_chatbot_db),
):

    query = db.query(ManualKnowledgeEntry)

    normalized_status = (
        status
        .lower()
        .strip()
    )

    if normalized_status == "active":
        query = query.filter(
            ManualKnowledgeEntry.IsActive == True
        )

    elif normalized_status == "inactive":
        query = query.filter(
            ManualKnowledgeEntry.IsActive == False
        )

    entries = (
        query
        .order_by(
            ManualKnowledgeEntry.CreatedAt.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        ManualEntryResponse(
            entry_id=entry.EntryID,
            title=entry.Title,
            content=entry.Content,
            category=entry.Category,
            created_at=format_utc_iso(entry.CreatedAt),
            updated_at=format_utc_iso(entry.UpdatedAt),
            is_active=bool(entry.IsActive),
            created_by=entry.CreatedBy,
            created_by_username=entry.CreatedByUsername,
            updated_by=entry.UpdatedBy,
            updated_by_username=entry.UpdatedByUsername,
        )
        for entry in entries
    ]


@router.put("/manual/{entry_id}", summary="Update a manual rule")
async def update_manual_knowledge(
    entry_id: str,
    request: ManualEntryUpdateRequest,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
    current_user: dict = Depends(require_admin_user),
):
    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)

    try:
        result = await ingestion_service.update_manual_entry(
            entry_id,
            request.model_dump(exclude_unset=True),
            db,
            acting_user_id=user_id,
            acting_username=username,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.delete("/manual/{entry_id}", summary="Delete a manual rule")
async def delete_manual_knowledge(
    entry_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
    current_user: dict = Depends(require_admin_user),
):
    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)

    result = await ingestion_service.delete_manual_entry(
        entry_id,
        db,
        acting_user_id=user_id,
        acting_username=username,
    )

    return result


@router.post("/manual/{entry_id}/restore", summary="Restore a deleted manual rule")
async def restore_manual_knowledge(
    entry_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
    current_user: dict = Depends(require_admin_user),
):
    user_id = int(current_user.get("id", 1))
    username = get_display_name(current_user)

    try:
        result = await ingestion_service.restore_manual_entry(
            entry_id,
            db,
            acting_user_id=user_id,
            acting_username=username,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )
