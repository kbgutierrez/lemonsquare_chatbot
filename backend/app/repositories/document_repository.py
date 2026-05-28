"""
Document and knowledge base database operations.
Centralizes ALL UploadedDocument, ManualKnowledgeEntry, and LearnedChat queries.
Previously scattered across routers (inline queries) and services.
"""
import logging
from sqlalchemy.orm import Session
from app.models.chatbot import UploadedDocument, ManualKnowledgeEntry, LearnedChat
from app.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)


class DocumentRepository:
    """Repository for document and manual knowledge persistence."""

    def __init__(self, db: Session):
        self.db = db

    # ── Uploaded Documents ─────────────────────────────────────

    def list_active_documents(self, category: str | None = None, skip: int = 0, limit: int = 50) -> list[UploadedDocument]:
        query = self.db.query(UploadedDocument).filter(UploadedDocument.IsActive == True)
        if category:
            query = query.filter(UploadedDocument.Category == category)
        return query.order_by(UploadedDocument.UploadedAt.desc()).offset(skip).limit(limit).all()

    def get_document_by_id(self, document_id: str) -> UploadedDocument | None:
        return self.db.query(UploadedDocument).filter(UploadedDocument.DocumentID == document_id).first()

    def require_document(self, document_id: str) -> UploadedDocument:
        doc = self.get_document_by_id(document_id)
        if not doc:
            raise NotFoundError(f"Document '{document_id}' not found.")
        return doc

    def count_active_documents(self) -> int:
        return self.db.query(UploadedDocument).filter(UploadedDocument.IsActive == True).count()

    # ── Manual Knowledge Entries ───────────────────────────────

    def list_active_manual_entries(self, skip: int = 0, limit: int = 50) -> list[ManualKnowledgeEntry]:
        return (
            self.db.query(ManualKnowledgeEntry)
            .filter(ManualKnowledgeEntry.IsActive == True)
            .order_by(ManualKnowledgeEntry.CreatedAt.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_manual_entry_by_id(self, entry_id: str) -> ManualKnowledgeEntry | None:
        return self.db.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.EntryID == entry_id).first()

    def require_manual_entry(self, entry_id: str) -> ManualKnowledgeEntry:
        entry = self.get_manual_entry_by_id(entry_id)
        if not entry:
            raise NotFoundError(f"Manual entry '{entry_id}' not found.")
        return entry

    def count_active_manual_entries(self) -> int:
        return self.db.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.IsActive == True).count()

    # ── Learned Chats ──────────────────────────────────────────

    def list_active_learned_chats(self, limit: int = 100) -> list[LearnedChat]:
        return (
            self.db.query(LearnedChat)
            .filter(LearnedChat.IsActive == True)
            .order_by(LearnedChat.LearnedAt.desc())
            .limit(limit)
            .all()
        )

    def get_learned_chat_by_session(self, session_id: str) -> LearnedChat | None:
        return self.db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()

    def require_learned_chat(self, session_id: str) -> LearnedChat:
        chat = self.get_learned_chat_by_session(session_id)
        if not chat:
            raise NotFoundError(f"Learned chat '{session_id}' not found.")
        return chat

    def count_active_learned_chats(self) -> int:
        return self.db.query(LearnedChat).filter(LearnedChat.IsActive == True).count()

    # ── Physical Deletion Operations ───────────────────────────

    def hard_delete_document(self, document_id: str) -> bool:
        """Physically removes the document record from SQL."""
        result = self.db.query(UploadedDocument).filter(
            UploadedDocument.DocumentID == document_id
        ).delete()
        self.db.commit()
        return result > 0

    def hard_delete_manual_entry(self, entry_id: str) -> bool:
        """Physically removes the manual knowledge entry from SQL."""
        result = self.db.query(ManualKnowledgeEntry).filter(
            ManualKnowledgeEntry.EntryID == entry_id
        ).delete()
        self.db.commit()
        return result > 0

    def truncate_owned_knowledge(self) -> None:
        """Wipes all documents, manual rules, and AI learned chats."""
        self.db.query(UploadedDocument).delete()
        self.db.query(ManualKnowledgeEntry).delete()
        self.db.query(LearnedChat).delete()
        self.db.commit()
