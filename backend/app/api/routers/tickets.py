"""
Ticket management router — REFACTORED.
Uses TicketRepository for DB operations.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, get_helpdesk_db, get_ingestion_service
from app.core.exceptions import VectorStoreError
from app.models.chatbot import BlacklistedTicket
from app.models.helpdesk import TicketEvaluation
from app.repositories.ticket_repository import TicketRepository
from app.schemas.tickets import (
    TicketDeleteResponse,
    TicketResponse,
    TicketResolveRequest,
    TicketSyncResponse,
)
from app.services.ingestion.ingestion_service import DocumentIngestionService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("", response_model=list[TicketResponse], summary="List resolved tickets")
def get_tickets(
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db_helpdesk: Session = Depends(get_helpdesk_db),
    db_chatbot: Session = Depends(get_chatbot_db),
) -> list[TicketResponse]:
    repo = TicketRepository(db_chatbot, db_helpdesk)
    blacklisted = repo.get_blacklisted_numbers()
    tickets = repo.list_resolved_tickets(search, skip, limit)
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


@router.delete("/{ticket_number}", response_model=TicketDeleteResponse, summary="Remove a ticket from the AI knowledge base")
def delete_ticket_from_ai(
    ticket_number: str,
    db_chatbot: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> TicketDeleteResponse:
    logger.info("Blacklisting ticket %s...", ticket_number)

    try:
        ingestion_service.delete_ticket_vectors(ticket_number)
        logger.info("Qdrant vectors deleted for ticket %s.", ticket_number)
    except Exception as exc:
        raise VectorStoreError(f"Qdrant deletion failed for ticket {ticket_number}: {exc}") from exc

    repo = TicketRepository(db_chatbot, None)
    repo.add_to_blacklist(ticket_number)

    return TicketDeleteResponse(
        status="success",
        message=f"Ticket {ticket_number} permanently removed from the AI knowledge base.",
    )


@router.post("/sync", response_model=TicketSyncResponse, summary="Webhook to sync a resolved ticket to the AI Brain")
async def sync_resolved_ticket(
    payload: TicketResolveRequest,
    db_chatbot: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
) -> TicketSyncResponse:
    result = await ingestion_service.process_resolved_ticket(payload.model_dump(), db_chatbot)
    return TicketSyncResponse(**result)


@router.post("/{ticket_number}/whitelist", summary="Remove Blacklist and Re-learn")
async def whitelist_ticket(
    ticket_number: str,
    db_chatbot: Session = Depends(get_chatbot_db),
    db_helpdesk: Session = Depends(get_helpdesk_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
):
    repo = TicketRepository(db_chatbot, db_helpdesk)

    # 1. Remove from blacklist
    removed = repo.remove_from_blacklist(ticket_number)
    if not removed:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_number} is not currently blacklisted.")

    # 2. Fetch original ticket
    original = repo.get_ticket_by_number(ticket_number)
    if not original:
        raise HTTPException(
            status_code=404,
            detail="Ticket removed from blacklist, but the original ticket could not be found.",
        )

    # 3. Re-ingest
    ticket_payload = TicketResolveRequest(
        ticket_number=original.ticket_number,
        issue_reported=original.issue_reported or "None",
        issue_found=original.issue_found or "None",
        issue_cause=original.issue_cause or "None",
        work_done=original.work_done or "None",
    )
    await ingestion_service.process_resolved_ticket(ticket_payload.model_dump(), db_chatbot)

    return {
        "status": "success",
        "message": f"Ticket {ticket_number} successfully whitelisted and re-learned by the AI.",
    }


@router.post("/bulk-sync", summary="Trigger a full Helpdesk sync in the background")
async def trigger_bulk_sync(background_tasks: BackgroundTasks):
    def run_bulk_ingestion_background():
        try:
            from scripts.ingest_tickets import run_ingestion
            logger.info("Starting background bulk ticket sync...")
            run_ingestion()
            logger.info("Background bulk ticket sync completed.")
        except Exception as e:
            logger.error("Background bulk ingestion failed: %s", e, exc_info=True)

    background_tasks.add_task(run_bulk_ingestion_background)
    return {
        "status": "success",
        "message": "Bulk sync initiated. The AI is currently updating its brain in the background.",
    }
