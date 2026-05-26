"""
Analytics service — REFACTORED from inline router logic.
Centralizes all analytics data aggregation.
"""
import logging
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.chatbot import (
    BlacklistedTicket,
    ChatSession,
    LearnedChat,
    ManualKnowledgeEntry,
    UploadedDocument,
)
from app.models.helpdesk import TicketEvaluation
from app.repositories.chat_repository import ChatRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.ticket_repository import TicketRepository

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Aggregates dashboard metrics from multiple repositories."""

    def __init__(self, db_chatbot: Session, db_helpdesk: Session):
        self.db_chatbot = db_chatbot
        self.db_helpdesk = db_helpdesk
        self.chat_repo = ChatRepository(db_chatbot)
        self.doc_repo = DocumentRepository(db_chatbot)
        self.ticket_repo = TicketRepository(db_chatbot, db_helpdesk)

    def get_summary(self) -> dict:
        """Return KPI dashboard metrics."""
        chatbot_counts = self.db_chatbot.query(
            select(func.count())
            .select_from(ChatSession)
            .where(ChatSession.IsActive == True)
            .scalar_subquery(),
            select(func.count())
            .select_from(ChatSession)
            .where(ChatSession.IsActive == True)
            .where(ChatSession.SessionStatus == "Escalated")
            .scalar_subquery(),
            select(func.count())
            .select_from(UploadedDocument)
            .where(UploadedDocument.IsActive == True)
            .scalar_subquery(),
            select(func.count())
            .select_from(ManualKnowledgeEntry)
            .where(ManualKnowledgeEntry.IsActive == True)
            .scalar_subquery(),
            select(func.count())
            .select_from(LearnedChat)
            .where(LearnedChat.IsActive == True)
            .scalar_subquery(),
            select(func.count())
            .select_from(BlacklistedTicket)
            .scalar_subquery(),
        ).one()
        (
            total_chats,
            escalated_chats,
            total_pdfs,
            total_rules,
            total_learned,
            blacklisted_count,
        ) = [int(value or 0) for value in chatbot_counts]

        total_resolved = int(
            self.db_helpdesk.query(func.count(TicketEvaluation.id))
            .filter(TicketEvaluation.work_done.isnot(None))
            .scalar()
            or 0
        )
        active_ai_tickets = total_resolved - blacklisted_count

        return {
            "status": "success",
            "total_uploaded_files": total_pdfs,
            "total_self_knowledge": total_rules + total_learned,
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
