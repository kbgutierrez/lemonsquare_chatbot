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

        doc.IsActive = False
        self.db.commit()

        # Delete from Qdrant by document_id filter
        from qdrant_client.http import models as qdrant_models
        self.vector_store.delete_by_filter([
            qdrant_models.FieldCondition(
                key="metadata.document_id",
                match=qdrant_models.MatchValue(value=document_id),
            )
        ])

        return {"status": "success", "document_id": document_id}

    async def update(self, document_id: str, updates: dict) -> None:
        doc = self.doc_repo.get_document_by_id(document_id)
        if not doc:
            raise ValueError(f"Document '{document_id}' not found.")

        if "file_name" in updates and updates["file_name"]:
            doc.FileName = updates["file_name"]
        if "category" in updates and updates["category"]:
            doc.Category = updates["category"]

        self.db.commit()
