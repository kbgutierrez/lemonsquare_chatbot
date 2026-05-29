"""
Document Ingestion Service — INTERFACE PRESERVED.
This facade preserves the exact public interface expected by all routers
delegating to focused sub-processors internally.

Public methods preserved:
  - process_pdf_upload(file, db, manual_category=None) -> dict
  - process_manual_entry(title, content, manual_category, db) -> dict
  - process_resolved_ticket(payload, db) -> dict
  - process_resolved_chat(session_id, db) -> dict
  - delete_document(document_id, db) -> dict
  - update_document(document_id, updates, db) -> None
  - update_manual_entry(entry_id, updates, db) -> dict
  - delete_manual_entry(entry_id, db) -> dict
  - restore_manual_entry(entry_id, db) -> dict
  - update_learned_chat(session_id, updates, db) -> dict
  - delete_learned_chat(session_id, db) -> dict
  - restore_learned_chat(session_id, db) -> dict

Properties preserved:
  - qdrant (QdrantClient)
  - embeddings (HuggingFaceEmbeddings)
  - collection_name (str)
"""
import logging
from app.core.config import settings
from app.services.retrieval.embedding_provider import get_embedding_model
from app.services.retrieval.vector_store import get_shared_vector_store

logger = logging.getLogger(__name__)


class DocumentIngestionService:
    """
    Knowledge ingestion coordinator.
    Preserves the exact interface used by all routers and the maintenance module.
    Internally delegates to focused sub-processors.
    """

    def __init__(self, db=None):
        self.vector_store = get_shared_vector_store()
        self.embeddings = get_embedding_model(settings.EMBEDDING_MODEL)
        self.collection_name = settings.QDRANT_COLLECTION

    # ── Properties for external access ─────────────────────────

    @property
    def qdrant(self):
        return self.vector_store.qdrant

    # ── PDF Upload ─────────────────────────────────────────────

    async def process_pdf_upload(
        self, file=None, db=None, manual_category=None,
        job_id=None, file_path=None, original_filename=None,
        acting_user_id: int = 1,
        acting_username: str = "System",
    ) -> dict:
        from app.services.ingestion.pdf_processor import PDFProcessor
        return await PDFProcessor(db, self.vector_store, self.embeddings).process(
            file=file,
            manual_category=manual_category,
            job_id=job_id,
            file_path=file_path,
            original_filename=original_filename,
            acting_user_id=acting_user_id,
            acting_username=acting_username,
        )

    # ── Manual Entry ───────────────────────────────────────────

    async def process_manual_entry(
        self, title: str, content: str, manual_category: str | None,
        db, acting_user_id: int = 1,
        acting_username: str = "System",
    ) -> dict:
        from app.services.ingestion.manual_entry_processor import ManualEntryProcessor
        return await ManualEntryProcessor(db, self.vector_store, self.embeddings).process(
            title=title, content=content, category=manual_category,
            acting_user_id=acting_user_id,
            acting_username=acting_username,
        )

    async def update_manual_entry(
        self, entry_id: str, updates: dict, db,
        acting_user_id: int = 1,
        acting_username: str = "System",
    ) -> dict:
        from app.services.ingestion.manual_entry_processor import ManualEntryProcessor
        return await ManualEntryProcessor(db, self.vector_store, self.embeddings).update(
            entry_id=entry_id, updates=updates,
            acting_user_id=acting_user_id,
            acting_username=acting_username,
        )

    async def delete_manual_entry(self, entry_id: str, db) -> dict:
        from app.services.ingestion.manual_entry_processor import ManualEntryProcessor
        return await ManualEntryProcessor(db, self.vector_store, self.embeddings).delete(
            entry_id=entry_id
        )

    async def restore_manual_entry(self, entry_id: str, db) -> dict:
        from app.services.ingestion.manual_entry_processor import ManualEntryProcessor
        return await ManualEntryProcessor(db, self.vector_store, self.embeddings).restore(
            entry_id=entry_id
        )

    # ── Resolved Ticket ────────────────────────────────────────

    async def process_resolved_ticket(self, payload: dict, db) -> dict:
        from app.services.ingestion.ticket_processor import TicketProcessor
        return await TicketProcessor(db, self.vector_store, self.embeddings).process(payload)

    def delete_ticket_vectors(self, ticket_number: str) -> None:
        self.vector_store.delete_ticket_vectors(ticket_number)

    # ── Resolved Chat ──────────────────────────────────────────

    async def process_resolved_chat(self, session_id: str, db) -> dict:
        from app.services.ingestion.chat_learning_processor import ChatLearningProcessor
        return await ChatLearningProcessor(db, self.vector_store, self.embeddings).process(
            session_id=session_id
        )

    async def update_learned_chat(self, session_id: str, updates: dict, db) -> dict:
        from app.services.ingestion.chat_learning_processor import ChatLearningProcessor
        return await ChatLearningProcessor(db, self.vector_store, self.embeddings).update(
            session_id=session_id, updates=updates
        )

    async def delete_learned_chat(self, session_id: str, db) -> dict:
        from app.services.ingestion.chat_learning_processor import ChatLearningProcessor
        return await ChatLearningProcessor(db, self.vector_store, self.embeddings).delete(
            session_id=session_id
        )

    async def restore_learned_chat(self, session_id: str, db) -> dict:
        from app.services.ingestion.chat_learning_processor import ChatLearningProcessor
        return await ChatLearningProcessor(db, self.vector_store, self.embeddings).restore(
            session_id=session_id
        )

    # ── Document Management ────────────────────────────────────

    async def delete_document(self, document_id: str, db) -> dict:
        from app.services.ingestion.document_processor import DocumentProcessor
        return await DocumentProcessor(db, self.vector_store, self.embeddings).delete(
            document_id=document_id
        )

    async def restore_document(self, document_id: str, db) -> dict:
        from app.services.ingestion.document_processor import DocumentProcessor
        return await DocumentProcessor(db, self.vector_store, self.embeddings).restore(
            document_id=document_id
        )

    async def update_document(
        self, document_id: str, updates: dict, db,
        acting_user_id: int = 1,
        acting_username: str = "System",
    ) -> None:
        from app.services.ingestion.document_processor import DocumentProcessor
        await DocumentProcessor(db, self.vector_store, self.embeddings).update(
            document_id=document_id, updates=updates,
            acting_user_id=acting_user_id,
            acting_username=acting_username,
        )
