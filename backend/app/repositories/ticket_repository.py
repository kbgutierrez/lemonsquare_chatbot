"""
Ticket-related database operations.
Centralizes ALL TicketEvaluation, BlacklistedTicket, and TicketHeader queries.
Previously scattered across tickets router (inline queries) and services.
"""
import logging
from sqlalchemy.orm import Session
from app.models.chatbot import BlacklistedTicket
from app.models.helpdesk import TicketEvaluation, TicketHeader

logger = logging.getLogger(__name__)


class TicketRepository:
    """Repository for ticket persistence and blacklist management."""

    def __init__(self, db_chatbot: Session, db_helpdesk: Session):
        self.db_chatbot = db_chatbot
        self.db_helpdesk = db_helpdesk

    # ── Blacklist Operations ───────────────────────────────────

    def get_blacklisted_numbers(self) -> set[str]:
        """Return a set of all blacklisted ticket numbers for O(1) lookups."""
        rows = self.db_chatbot.query(BlacklistedTicket.TicketNumber).all()
        return {r.TicketNumber for r in rows}

    def is_blacklisted(self, ticket_number: str) -> bool:
        return (
            self.db_chatbot.query(BlacklistedTicket)
            .filter(BlacklistedTicket.TicketNumber == ticket_number)
            .first()
            is not None
        )

    def add_to_blacklist(self, ticket_number: str) -> None:
        existing = (
            self.db_chatbot.query(BlacklistedTicket)
            .filter(BlacklistedTicket.TicketNumber == ticket_number)
            .first()
        )
        if not existing:
            self.db_chatbot.add(BlacklistedTicket(TicketNumber=ticket_number))
            self.db_chatbot.commit()

    def remove_from_blacklist(self, ticket_number: str) -> bool:
        entry = (
            self.db_chatbot.query(BlacklistedTicket)
            .filter(BlacklistedTicket.TicketNumber == ticket_number)
            .first()
        )
        if entry:
            self.db_chatbot.delete(entry)
            self.db_chatbot.commit()
            return True
        return False

    def count_blacklisted(self) -> int:
        return self.db_chatbot.query(BlacklistedTicket).count()

    # ── Resolved Tickets ───────────────────────────────────────

    def list_resolved_tickets(
        self,
        search: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[TicketEvaluation]:
        query = self.db_helpdesk.query(TicketEvaluation).filter(
            TicketEvaluation.work_done.isnot(None)
        )
        if search:
            query = query.filter(TicketEvaluation.ticket_number.contains(search))
        return (
            query.order_by(TicketEvaluation.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_ticket_by_number(self, ticket_number: str) -> TicketEvaluation | None:
        return (
            self.db_helpdesk.query(TicketEvaluation)
            .filter(TicketEvaluation.ticket_number == ticket_number)
            .first()
        )

    def count_resolved_with_work(self) -> int:
        return (
            self.db_helpdesk.query(TicketEvaluation)
            .filter(TicketEvaluation.work_done.isnot(None))
            .count()
        )

    # ── Ticket Headers (for routing taxonomy) ──────────────────

    def list_ticket_headers(self, limit: int = 1000) -> list[TicketHeader]:
        return self.db_helpdesk.query(TicketHeader).limit(limit).all()
