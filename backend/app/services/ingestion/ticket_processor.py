"""
Resolved ticket processor.
Ingests resolved helpdesk tickets into the knowledge base.
"""
import logging
from sqlalchemy.orm import Session
from qdrant_client.http.models import PointStruct
from app.core.exceptions import VectorStoreError
from app.models.chatbot import BlacklistedTicket
from app.services.consolidation.knowledge_consolidator import KnowledgeConsolidator

logger = logging.getLogger(__name__)


class TicketProcessor:
    def __init__(self, db: Session, vector_store, embeddings):
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.consolidator = KnowledgeConsolidator()

    async def process(self, payload: dict) -> dict:
        ticket_number = payload["ticket_number"]

        # Check blacklist
        blacklisted = self.db.query(BlacklistedTicket).filter(
            BlacklistedTicket.TicketNumber == ticket_number
        ).first()
        if blacklisted:
            return {
                "status": "skipped",
                "ticket_number": ticket_number,
                "message": "Ticket is blacklisted. Skipping ingestion.",
            }

        record = self.consolidator.build_raw_ticket_record(
            ticket_number=ticket_number,
            issue_reported=payload.get("issue_reported"),
            issue_found=payload.get("issue_found"),
            issue_cause=payload.get("issue_cause"),
            work_done=payload.get("work_done"),
            advanced_work_done=payload.get("advanced_work_done"),
        )
        if payload.get("id") is not None:
            record.metadata["evaluation_id"] = payload.get("id")
        elif payload.get("evaluation_id") is not None:
            record.metadata["evaluation_id"] = payload.get("evaluation_id")

        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, record.page_content)
        try:
            self.vector_store.upsert_points([PointStruct(
                id=record.point_id,
                vector=vector,
                payload={"page_content": record.page_content, "metadata": record.metadata}
            )])
        except Exception as exc:
            raise VectorStoreError(
                f"Failed to upsert ticket {ticket_number} to Qdrant."
            ) from exc

        return {
            "status": "success",
            "ticket_number": ticket_number,
            "message": f"Ticket {ticket_number} ingested successfully.",
        }
