"""
Knowledge Base Explorer router.
Queries SQL databases directly for the Admin Dashboard.
Preserved from original with repository usage.
"""

import json
import logging
import csv
import io
import asyncio

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import (
    get_chatbot_db,
    get_helpdesk_db,
)

from app.models.chatbot import (
    UploadedDocument,
    ManualKnowledgeEntry,
    LearnedChat,
)

from app.models.helpdesk import (
    TicketEvaluation,
)

from app.schemas.knowledge import (
    KnowledgeExplorerResponse,
    SemanticFaqResponse,
)

from app.repositories.ticket_repository import (
    TicketRepository,
)
from app.services.retrieval.vector_store import VectorStoreService
from app.services.retrieval.embedding_provider import get_embedding_model

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/knowledge",
    tags=["Explorer"],
)


@router.get(
    "/explore",
    response_model=list[KnowledgeExplorerResponse],
    summary="Browse Knowledge Base (SQL Source of Truth)",
)
async def explore_knowledge_base(
    doc_type: str | None = None,
    category: str | None = None,

    # =====================================
    # LIFECYCLE FILTER
    #
    # SUPPORTED:
    # ?lifecycle=active
    # ?lifecycle=inactive
    #
    # DEFAULT:
    # active
    # =====================================

    lifecycle: str = "active",

    limit: int = 100,

    db_chatbot: Session = Depends(
        get_chatbot_db
    ),

    db_helpdesk: Session = Depends(
        get_helpdesk_db
    ),
):

    results = []

    normalized_lifecycle = (
        lifecycle or "active"
    ).strip().lower()

    include_active = (
        normalized_lifecycle
        == "active"
    )

    include_inactive = (
        normalized_lifecycle
        == "inactive"
    )

    # =====================================
    # 1. MANUAL KNOWLEDGE
    # =====================================

    if doc_type in [
        None,
        "general_text",
    ]:

        query = db_chatbot.query(
            ManualKnowledgeEntry
        )

        if include_active:

            query = query.filter(
                ManualKnowledgeEntry.IsActive == True
            )

        elif include_inactive:

            query = query.filter(
                ManualKnowledgeEntry.IsActive == False
            )

        if category:

            query = query.filter(
                ManualKnowledgeEntry.Category
                == category
            )

        for m in (
            query
            .order_by(
                ManualKnowledgeEntry.CreatedAt.desc()
            )
            .limit(limit)
            .all()
        ):

            results.append({
                "id":
                    m.EntryID,

                "doc_type":
                    "general_text",

                "source":
                    m.Title,

                "category":
                    m.Category,

                "content":
                    m.Content,

                "is_active":
                    bool(m.IsActive),
            })

    # =====================================
    # 2. AI LEARNED CHATS
    # =====================================

    if (
        doc_type in [
            None,
            "resolved_chat",
        ]
        and (
            category is None
            or category == "AI Extraction"
        )
    ):

        query = db_chatbot.query(
            LearnedChat
        )

        if include_active:

            query = query.filter(
                LearnedChat.IsActive == True
            )

        elif include_inactive:

            query = query.filter(
                LearnedChat.IsActive == False
            )

        chats = (
            query
            .order_by(
                LearnedChat.LearnedAt.desc()
            )
            .limit(limit)
            .all()
        )

        for c in chats:

            content_dict = {
                "Issue Reported":
                    c.IssueReported,

                "Issue Found":
                    c.IssueFound,

                "Root Cause":
                    c.RootCause,

                "Work Done":
                    c.WorkDone,
            }

            results.append({
                "id":
                    c.SessionID,

                "doc_type":
                    "resolved_chat",

                "source":
                    f"Chat Session {c.SessionID[:8]}",

                "category":
                    "AI Extraction",

                "content":
                    json.dumps(
                        content_dict,
                        indent=2,
                    ),

                "is_active":
                    bool(c.IsActive),
            })

    # =====================================
    # 3. OFFICIAL DOCUMENTS
    # =====================================

    if doc_type in [
        None,
        "official_document",
    ]:

        query = db_chatbot.query(
            UploadedDocument
        )

        if include_active:

            query = query.filter(
                UploadedDocument.IsActive == True
            )

        elif include_inactive:

            query = query.filter(
                UploadedDocument.IsActive == False
            )

        if category:

            query = query.filter(
                UploadedDocument.Category
                == category
            )

        for d in (
            query
            .order_by(
                UploadedDocument.UploadedAt.desc()
            )
            .limit(limit)
            .all()
        ):

            results.append({
                "id":
                    d.DocumentID,

                "doc_type":
                    "official_document",

                "source":
                    d.FileName,

                "category":
                    d.Category,

                "content":
                    (
                        "[PDF Document containing "
                        f"{d.ChunkCount} vector chunks. "
                        "AI reads this dynamically during chat.]"
                    ),

                "is_active":
                    bool(d.IsActive),
            })

    # =====================================
    # 4. HELPDESK TICKETS
    # =====================================

    if (
        doc_type in [
            None,
            "helpdesk_ticket",
        ]
        and (
            category is None
            or category
            == "IT Helpdesk Sync"
        )
    ):

        repo = TicketRepository(
            db_chatbot,
            db_helpdesk,
        )

        blacklisted = (
            repo.get_blacklisted_numbers()
        )

        tickets = (
            db_helpdesk.query(
                TicketEvaluation
            )
            .filter(
                TicketEvaluation.work_done.isnot(None)
            )
            .order_by(
                TicketEvaluation.id.desc()
            )
            .limit(limit * 2)
            .all()
        )

        valid_added = 0

        for t in tickets:

            if (
                t.ticket_number
                in blacklisted
            ):
                continue

            if valid_added >= limit:
                break

            results.append({
                "id":
                    str(t.id),

                "doc_type":
                    "helpdesk_ticket",

                "source":
                    f"Ticket {t.ticket_number}",

                "category":
                    "IT Helpdesk Sync",

                "content":
                    (
                        f"REPORTED: {t.issue_reported}\n\n"
                        f"RESOLUTION: {t.work_done}"
                    ),

                # =================================
                # Tickets are always active
                # from explorer perspective
                # =================================

                "is_active":
                    True,
            })

            valid_added += 1

    # =====================================
    # GLOBAL LIMIT SAFETY
    # =====================================

    if (
        doc_type is None
        and category is None
    ):
        results = results[:limit]

    return results


def _format_faq_cluster(point) -> dict:
    payload = dict(getattr(point, "payload", {}) or {})
    metadata = dict(payload.get("metadata", {}) or {})

    return {
        "id": metadata.get("cluster_key") or metadata.get("source_id") or str(point.id),
        "source": metadata.get("sample_ticket_number") or metadata.get("related_ticket_numbers_sample", [None])[0] or "Ticket cluster",
        "content": payload.get("page_content", ""),
        "frequency": int(metadata.get("frequency", 1) or 1),
        "ticket_count": int(metadata.get("related_ticket_count", metadata.get("frequency", 1)) or 1),
        "sample_ticket_number": metadata.get("sample_ticket_number"),
    }


@router.get(
    "/faqs",
    response_model=list[SemanticFaqResponse],
    summary="Search semantic FAQ ticket clusters",
)
async def semantic_faq_clusters(
    q: str | None = None,
    limit: int = 5,
):
    """Return semantically relevant FAQ clusters from ticket knowledge."""
    if limit < 1:
        limit = 1

    vector_store = VectorStoreService()

    if q:
        embed_model = get_embedding_model()
        query_vector = await asyncio.to_thread(embed_model.embed_query, q)
        points = vector_store.search_ticket_clusters(query_vector, limit)
    else:
        points = vector_store.list_top_ticket_clusters(limit)

    return [_format_faq_cluster(point) for point in points]


@router.get("/export/learned-chats", summary="Export Resolved Chats to CSV")
async def export_learned_chats(
    db: Session = Depends(get_chatbot_db),
):
    """
    Downloads all resolved chats as a CSV file for performance tracking.
    """
    chats = (
        db.query(LearnedChat)
        .order_by(LearnedChat.LearnedAt.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Session ID",
        "User ID",
        "Issue Reported",
        "Issue Found",
        "Root Cause",
        "Work Done",
        "Resolved At",
        "Status"
    ])

    for c in chats:
        writer.writerow([
            c.SessionID,
            c.UserID,
            c.IssueReported,
            c.IssueFound,
            c.RootCause,
            c.WorkDone,
            c.LearnedAt.strftime("%Y-%m-%d %H:%M:%S") if c.LearnedAt else "",
            "Active" if c.IsActive else "Inactive"
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=resolved_chats_export.csv"
        }
    )