import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_helpdesk_db
from app.models.chatbot import (
    ChatSession, 
    UploadedDocument, 
    ManualKnowledgeEntry, 
    LearnedChat, 
    BlacklistedTicket
)
from app.models.helpdesk import TicketEvaluation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", summary="Get KPI Dashboard Metrics")
def get_analytics_summary(
    db_chatbot: Session = Depends(get_chatbot_db),
    db_helpdesk: Session = Depends(get_helpdesk_db)
):
    """Returns high-level counts for the Admin Dashboard."""
    
    # 1. Chat Metrics (Only counting active sessions)
    total_chats = db_chatbot.query(ChatSession).filter(ChatSession.IsActive == True).count()
    escalated_chats = db_chatbot.query(ChatSession).filter(
        ChatSession.SessionStatus == "Escalated", 
        ChatSession.IsActive == True
    ).count()

    # 2. Knowledge Base Metrics (Only counting active rules/docs)
    total_pdfs = db_chatbot.query(UploadedDocument).filter(UploadedDocument.IsActive == True).count()
    total_rules = db_chatbot.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.IsActive == True).count()
    total_learned_chats = db_chatbot.query(LearnedChat).filter(LearnedChat.IsActive == True).count()

    # 3. Helpdesk Sync Metrics
    blacklisted_count = db_chatbot.query(BlacklistedTicket).count()
    total_resolved_tickets = db_helpdesk.query(TicketEvaluation).filter(TicketEvaluation.work_done.isnot(None)).count()
    
    # The true number of tickets currently embedded in the AI's Qdrant brain
    active_ai_tickets = total_resolved_tickets - blacklisted_count

    return {
        "status": "success",
        "chats": {
            "total_active": total_chats,
            "escalated": escalated_chats
        },
        "knowledge_base": {
            "pdfs": total_pdfs,
            "manual_rules": total_rules,
            "ai_learned_chats": total_learned_chats,
            "synced_tickets": active_ai_tickets if active_ai_tickets > 0 else 0
        }
    }