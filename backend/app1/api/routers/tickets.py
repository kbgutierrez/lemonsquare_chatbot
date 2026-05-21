"""
Ticket management endpoints.

Admin operations for viewing and blacklisting IT support tickets.
Extracted from main.py for proper separation of concerns.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from qdrant_client.http import models as qdrant_models

from app.api.deps import get_chatbot_db, get_helpdesk_db
from app.core.config import settings
from app.core.exceptions import VectorStoreError
from app.models.chatbot import BlacklistedTicket
from app.models.helpdesk import TicketEvaluation
from app.api.deps import get_chatbot_db, get_helpdesk_db, get_ingestion_service
from app.services.ingestion_service import DocumentIngestionService
from app.schemas.tickets import TicketDeleteResponse, TicketResponse, TicketResolveRequest, TicketSyncResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tickets", tags=["Tickets"])


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
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> TicketDeleteResponse:
    """
    Hard-delete a ticket's vectors from Qdrant and add it to the SQL blacklist.

    Once blacklisted, the ticket will be excluded from future ingest runs
    and will never re-appear in the knowledge base.
    """
    logger.info("Blacklisting ticket %s...", ticket_number)

    # 1. Delete from Qdrant safely using the injected service client.
    try:
        ingestion_service.qdrant.delete(
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
    result = await ingestion_service.process_resolved_ticket(payload.model_dump(), db_chatbot)
    return TicketSyncResponse(**result)

@router.post("/{ticket_number}/whitelist", summary="Remove Blacklist and Re-learn")
async def whitelist_ticket(
    ticket_number: str, 
    db_chatbot: Session = Depends(get_chatbot_db),
    db_helpdesk: Session = Depends(get_helpdesk_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service)
):
    """
    Removes a ticket from the blacklist, fetches the original data from the Helpdesk, 
    and immediately re-ingests it into Qdrant.
    """
    from app.models.chatbot import BlacklistedTicket
    from app.models.helpdesk import TicketEvaluation 
    
    # 1. Verify and Remove from Blacklist
    blacklisted_entry = db_chatbot.query(BlacklistedTicket).filter(BlacklistedTicket.TicketNumber == ticket_number).first()
    if not blacklisted_entry:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_number} is not currently blacklisted.")
        
    db_chatbot.delete(blacklisted_entry)
    db_chatbot.commit()
    
    # 2. Fetch the original ticket data from the Helpdesk Database
    original_ticket = db_helpdesk.query(TicketEvaluation).filter(TicketEvaluation.ticket_number == ticket_number).first()
    if not original_ticket:
        raise HTTPException(
            status_code=404, 
            detail="Ticket removed from blacklist, but the original ticket could not be found in the Helpdesk DB to re-learn."
        )

    # 3. Format it perfectly for the Ingestion Service
    ticket_payload = TicketResolveRequest(
        ticket_number=original_ticket.ticket_number,
        issue_reported=original_ticket.issue_reported or "None",
        issue_found=original_ticket.issue_found or "None",
        issue_cause=original_ticket.issue_cause or "None",
        work_done=original_ticket.work_done or "None"
    )

    # 4. Push it back to Qdrant
    await ingestion_service.process_resolved_ticket(
        ticket_payload.model_dump(),
        db_chatbot
    )
    
    return {
        "status": "success", 
        "message": f"Ticket {ticket_number} successfully whitelisted and re-learned by the AI."
    }

def run_bulk_ingestion_background():
    """
    Wrapper to run the standalone script logic safely in a separate thread.
    We import inside the function to avoid circular dependencies.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        from scripts.ingest_tickets import run_ingestion
        logger.info("Starting background bulk ticket sync...")
        run_ingestion()
        logger.info("Background bulk ticket sync completed successfully.")
    except Exception as e:
        logger.error(f"Background bulk ingestion failed: {e}", exc_info=True)

@router.post("/bulk-sync", summary="Trigger a full Helpdesk sync in the background")
async def trigger_bulk_sync(background_tasks: BackgroundTasks):
    """
    Triggers the bulk ingestion script to find and embed any missed Helpdesk tickets.
    Runs asynchronously in the background so the UI doesn't freeze.
    """
    background_tasks.add_task(run_bulk_ingestion_background)
    
    return {
        "status": "success", 
        "message": "Bulk sync initiated. The AI is currently updating its brain in the background."
    }