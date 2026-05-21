"""
Knowledge Base Explorer endpoints.

Now queries the SQL database (Source of Truth) instead of scrolling Qdrant.
This provides a lightning-fast, clean, and deduplicated view for the Admin Dashboard.
"""

import logging
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_helpdesk_db
from app.schemas.knowledge import KnowledgeExplorerResponse
from app.models.chatbot import UploadedDocument, ManualKnowledgeEntry, LearnedChat, BlacklistedTicket
from app.models.helpdesk import TicketEvaluation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge", tags=["Explorer"])

@router.get(
    "/explore",
    response_model=list[KnowledgeExplorerResponse],
    summary="Browse Knowledge Base (SQL Source of Truth)"
)
async def explore_knowledge_base(
    doc_type: str | None = None,
    category: str | None = None,  # NEW: Added category filter
    limit: int = 100,
    db_chatbot: Session = Depends(get_chatbot_db),
    db_helpdesk: Session = Depends(get_helpdesk_db)
):
    """
    Queries the SQL databases directly to show what the AI currently knows.
    Supports filtering by top-level source (doc_type) and specific IT sub-categories (category).
    """
    results = []

    # 1. Manual Knowledge (general_text)
    if doc_type in [None, "general_text"]:
        query = db_chatbot.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.IsActive == True)
        if category:
            query = query.filter(ManualKnowledgeEntry.Category == category)
            
        for m in query.order_by(ManualKnowledgeEntry.CreatedAt.desc()).limit(limit).all():
            results.append({
                "id": m.EntryID,
                "doc_type": "general_text",
                "source": m.Title,
                "category": m.Category,
                "content": m.Content
            })

    # 2. AI-Learned Chats (resolved_chat)
    if doc_type in [None, "resolved_chat"] and (category is None or category == "AI Extraction"):
        chats = db_chatbot.query(LearnedChat).filter(LearnedChat.IsActive == True).order_by(LearnedChat.LearnedAt.desc()).limit(limit).all()
        for c in chats:
            content_dict = {
                "Issue Reported": c.IssueReported,
                "Issue Found": c.IssueFound,
                "Root Cause": c.RootCause,
                "Work Done": c.WorkDone
            }
            results.append({
                "id": c.SessionID,
                "doc_type": "resolved_chat",
                "source": f"Chat Session {c.SessionID[:8]}",
                "category": "AI Extraction",
                "content": json.dumps(content_dict, indent=2)
            })

    # 3. Official Documents / PDFs (official_document)
    if doc_type in [None, "official_document"]:
        query = db_chatbot.query(UploadedDocument).filter(UploadedDocument.IsActive == True)
        if category:
            query = query.filter(UploadedDocument.Category == category)
            
        for d in query.order_by(UploadedDocument.UploadedAt.desc()).limit(limit).all():
            results.append({
                "id": d.DocumentID,
                "doc_type": "official_document",
                "source": d.FileName,
                "category": d.Category,
                "content": f"[PDF Document containing {d.ChunkCount} vector chunks. AI reads this dynamically during chat.]"
            })

    # 4. Helpdesk Tickets (helpdesk_ticket)
    if doc_type in [None, "helpdesk_ticket"] and (category is None or category == "IT Helpdesk Sync"):
        blacklisted = {b.TicketNumber for b in db_chatbot.query(BlacklistedTicket.TicketNumber).all()}
        tickets = db_helpdesk.query(TicketEvaluation).filter(TicketEvaluation.work_done.isnot(None)).order_by(TicketEvaluation.id.desc()).limit(limit * 2).all()
        
        valid_tickets_added = 0
        for t in tickets:
            if t.ticket_number in blacklisted:
                continue
            if valid_tickets_added >= limit:
                break
                
            results.append({
                "id": str(t.id),
                "doc_type": "helpdesk_ticket",
                "source": f"Ticket {t.ticket_number}",
                "category": "IT Helpdesk Sync",
                "content": f"REPORTED: {t.issue_reported}\n\nRESOLUTION: {t.work_done}"
            })
            valid_tickets_added += 1

    if doc_type is None and category is None:
        results = results[:limit]

    return results