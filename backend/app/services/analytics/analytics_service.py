"""
Analytics service — REFACTORED from inline router logic.
Centralizes all analytics data aggregation.
"""
import logging
from sqlalchemy.orm import Session
from app.repositories.chat_repository import ChatRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.ticket_repository import TicketRepository

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Aggregates dashboard metrics from multiple repositories."""

    def __init__(self, db_chatbot: Session, db_helpdesk: Session):
        self.chat_repo = ChatRepository(db_chatbot)
        self.doc_repo = DocumentRepository(db_chatbot)
        self.ticket_repo = TicketRepository(db_chatbot, db_helpdesk)

    def get_summary(self) -> dict:
        """Return KPI dashboard metrics."""
        total_chats = self.chat_repo.count_active_sessions()
        escalated_chats = self.chat_repo.count_escalated_sessions()
        total_pdfs = self.doc_repo.count_active_documents()
        total_rules = self.doc_repo.count_active_manual_entries()
        total_learned = self.doc_repo.count_active_learned_chats()
        blacklisted_count = self.ticket_repo.count_blacklisted()
        total_resolved = self.ticket_repo.count_resolved_with_work()
        active_ai_tickets = total_resolved - blacklisted_count

        return {
            "status": "success",
            "chats": {
                "total_active": total_chats,
                "escalated": escalated_chats,
            },
            "knowledge_base": {
                "pdfs": total_pdfs,
                "manual_rules": total_rules,
                "ai_learned_chats": total_learned,
                "synced_tickets": max(active_ai_tickets, 0),
            }
        }
