"""
Document metadata processor.
Handles document CRUD operations (not the actual PDF parsing/embedding).
"""
import logging
from sqlalchemy.orm import Session
from app.models.chatbot import UploadedDocument
from app.repositories.document_repository import DocumentRepository

logger = logging.getLogger(__name__)


class DocumentProcessor:
    def __init__(self, db: Session, vector_store, embeddings):
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.doc_repo = DocumentRepository(db)

    async def delete(self, document_id: str) -> dict:
        doc = self.doc_repo.get_document_by_id(document_id)
        if not doc:
            return {"status": "error", "message": f"Document {document_id} not found."}
        if doc.IsActive is False:
            return {"status": "skipped", "document_id": document_id, "message": "Document is already inactive."}

        try:
            self.vector_store.soft_delete_by_metadata("document_id", document_id)
        except Exception as exc:
            raise RuntimeError(f"Failed to soft delete document in Qdrant: {exc}") from exc

        doc.IsActive = False
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            try:
                self.vector_store.restore_by_metadata("document_id", document_id)
            except Exception as cleanup_exc:
                logger.error(
                    "Failed to rollback Qdrant document soft-delete after DB error for %s: %s",
                    document_id,
                    cleanup_exc,
                )
            raise

        return {"status": "success", "document_id": document_id}

    async def restore(self, document_id: str) -> dict:
        doc = self.doc_repo.get_document_by_id(document_id)
        if not doc:
            raise ValueError(f"Document '{document_id}' not found.")
        if doc.IsActive is True:
            return {"status": "skipped", "document_id": document_id, "message": "Document is already active."}

        try:
            self.vector_store.restore_by_metadata("document_id", document_id)
        except Exception as exc:
            raise RuntimeError(f"Failed to restore document in Qdrant: {exc}") from exc

        doc.IsActive = True
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            try:
                self.vector_store.soft_delete_by_metadata("document_id", document_id)
            except Exception as cleanup_exc:
                logger.error(
                    "Failed to rollback Qdrant document restore after DB error for %s: %s",
                    document_id,
                    cleanup_exc,
                )
            raise

        return {"status": "success", "document_id": document_id}

    async def update(self, document_id: str, updates: dict) -> None:
        doc = self.doc_repo.get_document_by_id(document_id)
        if not doc:
            raise ValueError(f"Document '{document_id}' not found.")
        if doc.IsActive is False:
            raise ValueError(f"Document '{document_id}' is inactive. Restore it before updating.")

        original_file_name = doc.FileName
        original_category = doc.Category
        payload_updates = {}

        if "file_name" in updates and updates["file_name"]:
            doc.FileName = updates["file_name"]
            payload_updates["source"] = updates["file_name"]
            payload_updates["file_name"] = updates["file_name"]
        if "category" in updates and updates["category"]:
            doc.Category = updates["category"]
            payload_updates["category"] = updates["category"]

        if payload_updates:
            from qdrant_client.http import models as qdrant_models
            try:
                self.vector_store.update_metadata_by_filter(
                    [
                        qdrant_models.FieldCondition(
                            key="metadata.document_id",
                            match=qdrant_models.MatchValue(value=document_id),
                        )
                    ],
                    payload_updates,
                )
            except Exception as exc:
                self.db.rollback()
                raise RuntimeError(f"Failed to update document metadata in Qdrant: {exc}") from exc

        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            if payload_updates:
                try:
                    rollback_updates = {}
                    if "file_name" in updates and updates["file_name"]:
                        rollback_updates["source"] = original_file_name
                        rollback_updates["file_name"] = original_file_name
                    if "category" in updates and updates["category"]:
                        rollback_updates["category"] = original_category
                    from qdrant_client.http import models as qdrant_models
                    self.vector_store.update_metadata_by_filter(
                        [
                            qdrant_models.FieldCondition(
                                key="metadata.document_id",
                                match=qdrant_models.MatchValue(value=document_id),
                            )
                        ],
                        rollback_updates,
                    )
                except Exception as cleanup_exc:
                    logger.error(
                        "Failed to rollback Qdrant document metadata update after DB error for %s: %s",
                        document_id,
                        cleanup_exc,
                    )
            raise
