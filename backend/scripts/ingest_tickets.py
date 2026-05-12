"""
Standalone ticket ingestion script.

Syncs resolved helpdesk tickets from the SQL database into the Qdrant
vector store. Run this manually when you want to refresh the knowledge base.

Usage:
    cd backend
    python -m scripts.ingest_tickets

The script uses deterministic UUIDs (UUID5) so running it multiple times
is safe — existing tickets will be overwritten, not duplicated.
"""

import logging
import sys
import uuid
from pathlib import Path

# Allow imports from the app package when running as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore

from app.core.config import settings
from app.core.database import SessionChatbot, SessionHelpdesk
from app.core.logging import configure_logging
from app.models.chatbot import BlacklistedTicket
from app.models.helpdesk import TicketEvaluation

configure_logging()
logger = logging.getLogger(__name__)


def run_ingestion() -> None:
    """Fetch resolved tickets, filter blacklisted ones, and push to Qdrant."""
    logger.info("Connecting to databases...")
    db_helpdesk = SessionHelpdesk()
    db_chatbot = SessionChatbot()

    try:
        # 1. Load the blacklist for fast O(1) filtering.
        blacklisted_nums = {
            b.TicketNumber
            for b in db_chatbot.query(BlacklistedTicket.TicketNumber).all()
        }
        logger.info("Loaded %d blacklisted ticket numbers.", len(blacklisted_nums))

        # 2. Fetch all resolved tickets (those with a work_done value).
        all_tickets = (
            db_helpdesk.query(TicketEvaluation)
            .filter(TicketEvaluation.work_done.isnot(None))
            .all()
        )
        valid_tickets = [t for t in all_tickets if t.ticket_number not in blacklisted_nums]

        skipped = len(all_tickets) - len(valid_tickets)
        logger.info(
            "Processing %d valid tickets (%d blacklisted skipped).",
            len(valid_tickets),
            skipped,
        )

        # 3. Build Document objects for ingestion.
        docs: list[Document] = []
        ids: list[str] = []

        for ticket in valid_tickets:
            content = (
                f"TICKET NUMBER: {ticket.ticket_number}\n"
                f"ISSUE REPORTED: {ticket.issue_reported or 'None'}\n"
                f"ACTUAL ISSUE FOUND: {ticket.issue_found or 'None'}\n"
                f"ROOT CAUSE: {ticket.issue_cause or 'None'}\n"
                f"RESOLUTION (WORK DONE): {ticket.work_done or 'None'}\n"
                f"ADVANCED RESOLUTION: {ticket.advanced_work_done or 'None'}"
            )
            metadata = {
                "evaluation_id": ticket.id,
                "ticket_number": ticket.ticket_number,
                "doc_type": "ticket",
            }
            docs.append(Document(page_content=content, metadata=metadata))

            # Deterministic ID: same ticket always maps to the same Qdrant point.
            # Re-running ingestion overwrites rather than duplicates.
            ids.append(str(uuid.uuid5(uuid.NAMESPACE_DNS, f"ticket_{ticket.id}")))

        # 4. Load embeddings (may download on first run).
        logger.info("Loading embedding model: %s", settings.EMBEDDING_MODEL)
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

        # 5. Push to Qdrant.
        logger.info(
            "Uploading %d documents to Qdrant collection '%s'...",
            len(docs),
            settings.QDRANT_COLLECTION,
        )
        QdrantVectorStore.from_documents(
            docs,
            embeddings,
            ids=ids,
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            collection_name=settings.QDRANT_COLLECTION,
            force_recreate=False,
        )
        logger.info("Qdrant sync complete.")

    finally:
        db_helpdesk.close()
        db_chatbot.close()


if __name__ == "__main__":
    run_ingestion()
