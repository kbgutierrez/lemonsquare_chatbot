"""
Ticket management endpoints.

Admin operations for viewing and blacklisting IT support tickets.
Extracted from main.py for proper separation of concerns.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models

from app.api.deps import get_chatbot_db, get_helpdesk_db
from app.core.config import settings
from app.core.exceptions import VectorStoreError
from app.models.chatbot import BlacklistedTicket
from app.models.helpdesk import TicketEvaluation
from app.schemas.tickets import TicketDeleteResponse, TicketResponse
from app.api.deps import get_chatbot_db, get_helpdesk_db, get_ingestion_service
from app.services.ingestion_service import DocumentIngestionService
from app.schemas.tickets import TicketDeleteResponse, TicketResponse, TicketResolveRequest, TicketSyncResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tickets", tags=["Tickets"])

# Qdrant client for ticket-blacklist operations.
# This is a lightweight client object (no ML models), so constructing it
# here as a module-level instance is acceptable.
_qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)


@router.get(
    "",
    response_model=list[TicketResponse],
    summary="List resolved tickets",
)
def get_tickets(
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db_helpdesk: Session = Depends(get_helpdesk_db),
    db_chatbot: Session = Depends(get_chatbot_db),
) -> list[TicketResponse]:
    """
    Return resolved tickets with a flag indicating if each is blacklisted.

    Uses a set for O(1) blacklist lookups instead of a per-ticket query.
    """
    blacklisted = {
        b.TicketNumber
        for b in db_chatbot.query(BlacklistedTicket.TicketNumber).all()
    }

    query = db_helpdesk.query(TicketEvaluation).filter(
        TicketEvaluation.work_done.isnot(None)
    )
    if search:
        query = query.filter(TicketEvaluation.ticket_number.contains(search))

    tickets = (
        query.order_by(TicketEvaluation.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        TicketResponse(
            id=t.id,
            ticket_number=t.ticket_number,
            issue_reported=t.issue_reported,
            work_done=t.work_done,
            is_blacklisted=t.ticket_number in blacklisted,
        )
        for t in tickets
    ]


@router.delete(
    "/{ticket_number}",
    response_model=TicketDeleteResponse,
    summary="Remove a ticket from the AI knowledge base",
)
def delete_ticket_from_ai(
    ticket_number: str,
    db_chatbot: Session = Depends(get_chatbot_db),
) -> TicketDeleteResponse:
    """
    Hard-delete a ticket's vectors from Qdrant and add it to the SQL blacklist.

    Once blacklisted, the ticket will be excluded from future ingest runs
    and will never re-appear in the knowledge base.
    """
    logger.info("Blacklisting ticket %s...", ticket_number)

    # 1. Delete from Qdrant.
    try:
        _qdrant.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.ticket_number",
                        match=qdrant_models.MatchValue(value=ticket_number),
                    )
                ]
            ),
        )
        logger.info("Qdrant vectors deleted for ticket %s.", ticket_number)
    except Exception as exc:
        raise VectorStoreError(f"Qdrant deletion failed for ticket {ticket_number}: {exc}") from exc

    # 2. Add to SQL blacklist.
    existing = (
        db_chatbot.query(BlacklistedTicket)
        .filter(BlacklistedTicket.TicketNumber == ticket_number)
        .first()
    )
    if not existing:
        db_chatbot.add(BlacklistedTicket(TicketNumber=ticket_number))
        try:
            db_chatbot.commit()
            logger.info("Ticket %s added to blacklist.", ticket_number)
        except Exception as exc:
            db_chatbot.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to write blacklist entry: {exc}",
            ) from exc

    return TicketDeleteResponse(
        status="success",
        message=f"Ticket {ticket_number} permanently removed from the AI knowledge base.",
    )

@router.post(
    "/sync",
    response_model=TicketSyncResponse,
    summary="Webhook to sync a resolved ticket to the AI Brain",
)
async def sync_resolved_ticket(
    payload: TicketResolveRequest,
    db_chatbot: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> TicketSyncResponse:
    """
    Receives resolved ticket data, cleans it using an LLM, and ingests it into Qdrant.
    Call this API immediately after saving the ticket in the Helpdesk database.
    """
    # Pass the payload dictionary directly to the ingestion service
    result = await ingestion_service.process_resolved_ticket(payload.model_dump(), db_chatbot)
    
    return TicketSyncResponse(**result)
