"""
Knowledge Base Explorer router.
Queries SQL databases directly for the Admin Dashboard.
Preserved from original with repository usage.
"""
import json
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, get_helpdesk_db
from app.models.chatbot import UploadedDocument, ManualKnowledgeEntry, LearnedChat, BlacklistedTicket
from app.models.helpdesk import TicketEvaluation
from app.schemas.knowledge import KnowledgeExplorerResponse
from app.repositories.ticket_repository import TicketRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge", tags=["Explorer"])


@router.get("/explore", response_model=list[KnowledgeExplorerResponse], summary="Browse Knowledge Base (SQL Source of Truth)")
async def explore_knowledge_base(
    doc_type: str | None = None,
    category: str | None = None,
    limit: int = 100,
    db_chatbot: Session = Depends(get_chatbot_db),
    db_helpdesk: Session = Depends(get_helpdesk_db),
):
    results = []

    # 1. Manual Knowledge
    if doc_type in [None, "general_text"]:
        query = db_chatbot.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.IsActive == True)
        if category:
            query = query.filter(ManualKnowledgeEntry.Category == category)
        for m in query.order_by(ManualKnowledgeEntry.CreatedAt.desc()).limit(limit).all():
            results.append({"id": m.EntryID, "doc_type": "general_text", "source": m.Title, "category": m.Category, "content": m.Content})

    # 2. AI-Learned Chats
    if doc_type in [None, "resolved_chat"] and (category is None or category == "AI Extraction"):
        chats = db_chatbot.query(LearnedChat).filter(LearnedChat.IsActive == True).order_by(LearnedChat.LearnedAt.desc()).limit(limit).all()
        for c in chats:
            content_dict = {
                "Issue Reported": c.IssueReported,
                "Issue Found": c.IssueFound,
                "Root Cause": c.RootCause,
                "Work Done": c.WorkDone,
            }
            results.append({
                "id": c.SessionID,
                "doc_type": "resolved_chat",
                "source": f"Chat Session {c.SessionID[:8]}",
                "category": "AI Extraction",
                "content": json.dumps(content_dict, indent=2),
            })

    # 3. Official Documents / PDFs
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
                "content": f"[PDF Document containing {d.ChunkCount} vector chunks. AI reads this dynamically during chat.]",
            })

    # 4. Helpdesk Tickets
    if doc_type in [None, "helpdesk_ticket"] and (category is None or category == "IT Helpdesk Sync"):
        repo = TicketRepository(db_chatbot, db_helpdesk)
        blacklisted = repo.get_blacklisted_numbers()
        tickets = db_helpdesk.query(TicketEvaluation).filter(TicketEvaluation.work_done.isnot(None)).order_by(TicketEvaluation.id.desc()).limit(limit * 2).all()
        valid_added = 0
        for t in tickets:
            if t.ticket_number in blacklisted:
                continue
            if valid_added >= limit:
                break
            results.append({
                "id": str(t.id),
                "doc_type": "helpdesk_ticket",
                "source": f"Ticket {t.ticket_number}",
                "category": "IT Helpdesk Sync",
                "content": f"REPORTED: {t.issue_reported}\n\nRESOLUTION: {t.work_done}",
            })
            valid_added += 1

    if doc_type is None and category is None:
        results = results[:limit]

    return results
