"""
Standalone ticket ingestion script.

Groups semantically similar helpdesk tickets into canonical knowledge entries
before embedding them into Qdrant.

Usage:
    cd backend
    python -m scripts.ingest_tickets

What this does:
- Loads resolved tickets from SQL
- Skips blacklisted tickets
- Groups near-identical tickets into canonical clusters
- Builds one vector per cluster instead of one vector per raw ticket
- Uploads in batches to Qdrant
- Uses SQL-based sync state to skip unchanged clusters on later runs
"""

from __future__ import annotations

import argparse
import hashlib
import logging
import re
import sys
import uuid
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

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
from app.repositories.ingestion_state_repository import IngestionStateRepository

configure_logging()
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ClusterDocument:
    cluster_key: str
    document: Document
    vector_id: str
    content_hash: str
    ticket_count: int


def normalize_text(value: Any) -> str:
    """Convert a value to normalized text for grouping."""
    if value is None:
        return ""
    text = str(value).strip().lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def stable_text(value: Any) -> str:
    """Stable display text for human-readable content."""
    if value is None:
        return "None"
    text = str(value).strip()
    return text if text else "None"


def build_grouping_signature(ticket: TicketEvaluation) -> str:
    """
    Create a stable grouping signature from the most important fields.

    This is intentionally conservative: tickets that look almost the same
    in issue/caused/fix language will collapse into one cluster.
    """
    fields = [
        normalize_text(ticket.issue_reported),
        normalize_text(ticket.issue_found),
        normalize_text(ticket.issue_cause),
        normalize_text(ticket.work_done),
        normalize_text(ticket.advanced_work_done),
    ]
    combined = " | ".join(fields)
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


def build_content_hash(content: str) -> str:
    """Stable hash for the canonical cluster document content."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def make_vector_id(cluster_key: str) -> str:
    """Deterministic UUID5 so reruns overwrite the same Qdrant point."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"cluster_{cluster_key}"))


def chunked(items: list[Any], batch_size: int) -> list[list[Any]]:
    """Split a list into batches."""
    return [items[i : i + batch_size] for i in range(0, len(items), batch_size)]


def fetch_blacklisted_ticket_numbers(db_chatbot) -> set[Any]:
    """Load blacklisted ticket numbers into a set for O(1) lookups."""
    rows = db_chatbot.query(BlacklistedTicket.TicketNumber).all()
    return {row[0] for row in rows}


def fetch_resolved_tickets(db_helpdesk) -> list[TicketEvaluation]:
    """Fetch tickets with non-empty work_done."""
    all_tickets = (
        db_helpdesk.query(TicketEvaluation)
        .filter(TicketEvaluation.work_done.isnot(None))
        .all()
    )

    resolved = [
        ticket
        for ticket in all_tickets
        if str(ticket.work_done).strip()
    ]
    return resolved


def build_canonical_content(tickets: list[TicketEvaluation]) -> str:
    """
    Build a canonical document from a cluster of similar tickets.

    The first ticket is used as the representative sample, but the
    cluster content includes frequency and related ticket numbers.
    """
    representative = tickets[0]
    related_ticket_numbers = [
        str(t.ticket_number) for t in tickets if t.ticket_number is not None
    ]

    issue_reported_values = [
        stable_text(t.issue_reported)
        for t in tickets
        if str(t.issue_reported).strip()
    ]
    issue_found_values = [
        stable_text(t.issue_found)
        for t in tickets
        if str(t.issue_found).strip()
    ]
    issue_cause_values = [
        stable_text(t.issue_cause)
        for t in tickets
        if str(t.issue_cause).strip()
    ]
    work_done_values = [
        stable_text(t.work_done)
        for t in tickets
        if str(t.work_done).strip()
    ]
    advanced_work_done_values = [
        stable_text(t.advanced_work_done)
        for t in tickets
        if str(t.advanced_work_done).strip()
    ]

    def pick_example(values: list[str]) -> str:
        if not values:
            return "None"
        # Return the most common exact string if available; otherwise the first.
        counts: dict[str, int] = {}
        for v in values:
            counts[v] = counts.get(v, 0) + 1
        return max(counts.items(), key=lambda item: item[1])[0]

    most_common_reported = pick_example(issue_reported_values)
    most_common_found = pick_example(issue_found_values)
    most_common_cause = pick_example(issue_cause_values)
    most_common_work = pick_example(work_done_values)
    most_common_advanced = pick_example(advanced_work_done_values)

    sample_ticket_numbers = ", ".join(related_ticket_numbers[:30])
    if len(related_ticket_numbers) > 30:
        sample_ticket_numbers += f" ... (+{len(related_ticket_numbers) - 30} more)"

    content = (
        "CANONICAL HELPDESK ISSUE\n"
        "========================\n"
        f"REPRESENTATIVE TICKET NUMBER: {stable_text(representative.ticket_number)}\n"
        f"TOTAL OCCURRENCES: {len(tickets)}\n\n"
        f"COMMON ISSUE REPORTED: {most_common_reported}\n"
        f"COMMON ACTUAL ISSUE FOUND: {most_common_found}\n"
        f"COMMON ROOT CAUSE: {most_common_cause}\n"
        f"STANDARD RESOLUTION (WORK DONE): {most_common_work}\n"
        f"ADVANCED RESOLUTION: {most_common_advanced}\n\n"
        f"RELATED TICKET NUMBERS: {sample_ticket_numbers}\n"
    )
    return content


def build_cluster_documents(
    tickets: list[TicketEvaluation],
    blacklisted_nums: set[Any],
    previous_state: dict[str, str],
) -> tuple[list[ClusterDocument], list[ClusterDocument], int, int, int]:
    """
    Build BOTH raw ticket documents AND canonical cluster documents.

    Returns:
      - raw_ticket_docs (one per ticket for exact lookup)
      - canonical_cluster_docs (consolidated for semantic memory)
      - skipped blacklisted count
      - skipped unchanged cluster count
      - skipped unchanged raw count
    """
    grouped: dict[str, list[TicketEvaluation]] = defaultdict(list)
    raw_docs: list[ClusterDocument] = []
    skipped_blacklisted = 0
    skipped_raw = 0

    for ticket in tickets:
        if ticket.ticket_number in blacklisted_nums:
            skipped_blacklisted += 1
            continue

        # Build raw ticket document (one per ticket)
        raw_key = f"raw_{ticket.ticket_number}"
        raw_content = (
            f"TICKET NUMBER: {stable_text(ticket.ticket_number)}\n"
            f"ISSUE REPORTED: {stable_text(ticket.issue_reported)}\n"
            f"ACTUAL ISSUE FOUND: {stable_text(ticket.issue_found)}\n"
            f"ROOT CAUSE: {stable_text(ticket.issue_cause)}\n"
            f"RESOLUTION (WORK DONE): {stable_text(ticket.work_done)}\n"
            f"ADVANCED RESOLUTION: {stable_text(ticket.advanced_work_done)}\n"
        )
        raw_content_hash = build_content_hash(raw_content)

        if previous_state.get(raw_key) == raw_content_hash:
            skipped_raw += 1
        else:
            raw_vector_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"raw_ticket_{ticket.ticket_number}"))
            raw_metadata = {
                "doc_type": "raw_ticket",
                "knowledge_type": "ticket",
                "category": "Database Helpdesk Sync",
                "ticket_number": stable_text(ticket.ticket_number),
                "source_id": stable_text(ticket.ticket_number),
                "source_ids": [stable_text(ticket.ticket_number)],
                "cluster_key": raw_key,
                "is_active": True,
                "frequency": 1,
            }
            raw_doc = Document(page_content=raw_content, metadata=raw_metadata)
            raw_docs.append(
                ClusterDocument(
                    cluster_key=raw_key,
                    document=raw_doc,
                    vector_id=raw_vector_id,
                    content_hash=raw_content_hash,
                    ticket_count=1,
                )
            )

        # Group for canonical clustering
        group_key = build_grouping_signature(ticket)
        grouped[group_key].append(ticket)

    # Build canonical clusters
    cluster_docs: list[ClusterDocument] = []
    skipped_unchanged = 0

    for cluster_key, cluster_tickets in grouped.items():
        content = build_canonical_content(cluster_tickets)
        content_hash = build_content_hash(content)

        if previous_state.get(cluster_key) == content_hash:
            skipped_unchanged += 1
            continue

        representative = cluster_tickets[0]
        related_ticket_numbers = [
            t.ticket_number for t in cluster_tickets if t.ticket_number is not None
        ]

        metadata = {
            "doc_type": "canonical_ticket_cluster",
            "knowledge_type": "ticket",
            "category": "Database Helpdesk Sync",
            "cluster_key": cluster_key,
            "source_id": stable_text(representative.ticket_number),
            "source_ids": [stable_text(t) for t in related_ticket_numbers],
            "is_active": True,
            "content_hash": content_hash,
            "frequency": len(cluster_tickets),
            "related_ticket_count": len(cluster_tickets),
            "sample_ticket_number": stable_text(representative.ticket_number),
            "related_ticket_numbers_sample": related_ticket_numbers[:30],
        }

        document = Document(
            page_content=content,
            metadata=metadata,
        )

        vector_id = make_vector_id(cluster_key)

        cluster_docs.append(
            ClusterDocument(
                cluster_key=cluster_key,
                document=document,
                vector_id=vector_id,
                content_hash=content_hash,
                ticket_count=len(cluster_tickets),
            )
        )

    logger.info("Skipped %d blacklisted tickets.", skipped_blacklisted)
    logger.info("Built %d new/updated raw ticket documents (skipped %d unchanged).", len(raw_docs), skipped_raw)
    logger.info("Built %d new/updated canonical clusters (skipped %d unchanged).", len(cluster_docs), skipped_unchanged)

    return raw_docs, cluster_docs, skipped_blacklisted, skipped_unchanged, skipped_raw


def upload_batches(
    cluster_docs: list[ClusterDocument],
    embeddings: HuggingFaceEmbeddings,
    batch_size: int,
    repo: IngestionStateRepository,
) -> int:
    """
    Upload documents to Qdrant in batches and update state atomically in SQL.
    Returns the number of uploaded documents.
    """
    if not cluster_docs:
        return 0

    uploaded = 0
    batches = chunked(cluster_docs, batch_size)

    for index, batch in enumerate(batches, start=1):
        docs = [item.document for item in batch]
        ids = [item.vector_id for item in batch]

        logger.info(
            "Uploading batch %d/%d (%d documents) to Qdrant collection '%s'...",
            index,
            len(batches),
            len(batch),
            settings.QDRANT_COLLECTION,
        )

        try:
            QdrantVectorStore.from_documents(
                documents=docs,
                embedding=embeddings,
                ids=ids,
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                collection_name=settings.QDRANT_COLLECTION,
                force_recreate=False,
            )
        except Exception as exc:
            logger.error("Failed to upload batch to Qdrant: %s", exc)
            # We don't update SQL if Qdrant failed
            raise

        # Atomically update SQL state after Qdrant success
        records = [
            {
                "EntityKey": item.cluster_key,
                "EntityType": item.document.metadata.get("doc_type", "unknown"),
                "ContentHash": item.content_hash,
            }
            for item in batch
        ]
        
        try:
            repo.bulk_upsert_state(records)
        except Exception as exc:
            logger.error("Qdrant succeeded but SQL state update failed: %s", exc)
            # This is the "split-brain" risk handled by the reconciler in the plan
            raise

        uploaded += len(batch)

    return uploaded


def run_ingestion(batch_size: int = 20) -> None:
    """Fetch tickets, consolidate them into canonical clusters, and push to Qdrant."""
    logger.info("Starting canonical ticket ingestion...")
    logger.info("Using batch size: %d", batch_size)

    db_helpdesk = SessionHelpdesk()
    db_chatbot = SessionChatbot()
    repo = IngestionStateRepository(db_chatbot)

    try:
        logger.info("Loading previous sync state from SQL...")
        previous_state = repo.get_all_state()
        logger.info("Loaded %d state records from SQL.", len(previous_state))

        logger.info("Loading blacklist...")
        blacklisted_nums = fetch_blacklisted_ticket_numbers(db_chatbot)
        logger.info("Loaded %d blacklisted ticket numbers.", len(blacklisted_nums))

        logger.info("Fetching resolved tickets from Helpdesk...")
        resolved_tickets = fetch_resolved_tickets(db_helpdesk)
        logger.info("Fetched %d resolved tickets.", len(resolved_tickets))

        logger.info("Grouping tickets and diffing against state...")
        raw_docs, cluster_docs, skipped_blacklisted, skipped_unchanged, skipped_raw = build_cluster_documents(
            tickets=resolved_tickets,
            blacklisted_nums=blacklisted_nums,
            previous_state=previous_state,
        )

        logger.info(
            "Ready to upload %d raw tickets + %d canonical clusters (%d raw and %d clusters skipped as unchanged).",
            len(raw_docs),
            len(cluster_docs),
            skipped_raw,
            skipped_unchanged,
        )

        if not raw_docs and not cluster_docs:
            logger.info("Nothing new to ingest. Sync complete.")
            return

        logger.info("Loading embedding model: %s", settings.EMBEDDING_MODEL)
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

        # Upload raw tickets first for exact lookup coverage
        if raw_docs:
            logger.info("Uploading %d raw ticket vectors...", len(raw_docs))
            uploaded_raw = upload_batches(
                cluster_docs=raw_docs,
                embeddings=embeddings,
                batch_size=batch_size,
                repo=repo,
            )
            logger.info("Uploaded %d raw tickets.", uploaded_raw)

        # Then upload canonical clusters for semantic memory
        if cluster_docs:
            logger.info("Uploading %d canonical cluster vectors...", len(cluster_docs))
            uploaded_canonical = upload_batches(
                cluster_docs=cluster_docs,
                embeddings=embeddings,
                batch_size=batch_size,
                repo=repo,
            )
            logger.info("Uploaded %d canonical clusters.", uploaded_canonical)

        logger.info("Qdrant sync complete.")

    finally:
        db_helpdesk.close()
        db_chatbot.close()
        logger.info("Database sessions closed.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Ingest resolved tickets into Qdrant as canonical knowledge clusters."
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=20,
        help="Number of canonical documents to upload per batch.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_ingestion(batch_size=max(1, args.batch_size))
