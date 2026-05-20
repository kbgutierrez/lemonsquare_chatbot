"""
Reingest all knowledge into Qdrant.

This script will (in order):
  1. Reingest routing examples
  2. Rebuild canonical ticket clusters
  3. Reingest manual knowledge entries
  4. Reingest learned chats

Uploaded PDF reingestion requires original files; this script will log and skip
uploaded PDFs unless an environment variable `UPLOAD_DIR` points to a folder
that contains the original filenames.

Usage:
    cd backend
    python -m scripts.reingest_all
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow imports from the app package when running as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import logging
import os

from app.core.database import SessionChatbot
from app.core.logging import configure_logging
from app.services.ingestion_service import DocumentIngestionService
from app.services.consolidator import KnowledgeConsolidator

configure_logging()
logger = logging.getLogger(__name__)


def run_all():
    # 1) Routing
    try:
        from scripts.ingest_routing import run_routing_ingestion

        logger.info("Running routing ingestion...")
        run_routing_ingestion()
    except Exception as exc:
        logger.exception("Routing ingestion failed: %s", exc)

    # 2) Tickets (canonical clustering)
    try:
        from scripts.ingest_tickets import run_ingestion

        logger.info("Running canonical ticket ingestion...")
        run_ingestion()
    except Exception as exc:
        logger.exception("Ticket ingestion failed: %s", exc)

    # 3) Manual entries and learned chats: re-upsert canonical cluster points
    db = SessionChatbot()
    try:
        service = DocumentIngestionService(db=db)
        consolidator = KnowledgeConsolidator()

        async def reupsert_manual_and_chats():
            # Manual entries
            from app.models.chatbot import ManualKnowledgeEntry, LearnedChat

            manual_rows = db.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.IsActive == True).all()
            logger.info("Re-ingesting %d manual entries...", len(manual_rows))
            for entry in manual_rows:
                record = consolidator.build_manual_record(
                    entry_id=entry.EntryID,
                    title=entry.Title,
                    content=entry.Content,
                    category=entry.Category,
                )
                await service._upsert_canonical_point_async(
                    db=db,
                    source_id=entry.EntryID,
                    source_type="manual",
                    cluster_id=record.point_id,
                    cluster_key=record.cluster_key,
                    page_content=record.page_content,
                    metadata=record.metadata,
                )

            # Learned chats
            chat_rows = db.query(LearnedChat).filter(LearnedChat.IsActive == True).all()
            logger.info("Re-ingesting %d learned chats...", len(chat_rows))
            for chat in chat_rows:
                record = consolidator.build_chat_record(
                    session_id=chat.SessionID,
                    issue_reported=chat.IssueReported,
                    issue_found=chat.IssueFound,
                    issue_cause=chat.RootCause,
                    work_done=chat.WorkDone,
                )
                await service._upsert_canonical_point_async(
                    db=db,
                    source_id=chat.SessionID,
                    source_type="chat",
                    cluster_id=record.point_id,
                    cluster_key=record.cluster_key,
                    page_content=record.page_content,
                    metadata=record.metadata,
                )

        asyncio.run(reupsert_manual_and_chats())

    finally:
        db.close()


if __name__ == "__main__":
    run_all()
