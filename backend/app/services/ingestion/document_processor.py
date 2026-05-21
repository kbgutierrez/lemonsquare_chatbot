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

        doc.IsActive = False
        self.db.commit()

        self.vector_store.soft_delete_by_metadata("document_id", document_id)

        return {"status": "success", "document_id": document_id}

    async def restore(self, document_id: str) -> dict:
        doc = self.doc_repo.get_document_by_id(document_id)
        if not doc:
            raise ValueError(f"Document '{document_id}' not found.")
        if doc.IsActive is True:
            return {"status": "skipped", "document_id": document_id, "message": "Document is already active."}

        doc.IsActive = True
        self.db.commit()
        self.vector_store.restore_by_metadata("document_id", document_id)

        return {"status": "success", "document_id": document_id}

    async def update(self, document_id: str, updates: dict) -> None:
        doc = self.doc_repo.get_document_by_id(document_id)
        if not doc:
            raise ValueError(f"Document '{document_id}' not found.")
        if doc.IsActive is False:
            raise ValueError(f"Document '{document_id}' is inactive. Restore it before updating.")

        if "file_name" in updates and updates["file_name"]:
            doc.FileName = updates["file_name"]
        if "category" in updates and updates["category"]:
            doc.Category = updates["category"]

        self.db.commit()

        payload_updates = {}
        if "file_name" in updates and updates["file_name"]:
            payload_updates["source"] = updates["file_name"]
            payload_updates["file_name"] = updates["file_name"]
        if "category" in updates and updates["category"]:
            payload_updates["category"] = updates["category"]
        if payload_updates:
            from qdrant_client.http import models as qdrant_models
            self.vector_store.update_metadata_by_filter(
                [
                    qdrant_models.FieldCondition(
                        key="metadata.document_id",
                        match=qdrant_models.MatchValue(value=document_id),
                    )
                ],
                payload_updates,
            )
