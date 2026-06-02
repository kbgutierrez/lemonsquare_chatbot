"""
One-time seed script to migrate state from JSON to SQL.
Reads .ticket_cluster_state.json and populates tbl_ingestion_sync_state.

Usage:
    cd backend
    python -m scripts.seed_ingestion_state
"""
import json
import logging
import sys
from pathlib import Path

# Allow imports from the app package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionChatbot
from app.repositories.ingestion_state_repository import IngestionStateRepository
from app.core.logging import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

STATE_PATH = Path(__file__).resolve().parent.parent / ".ticket_cluster_state.json"

def seed_state():
    if not STATE_PATH.exists():
        logger.info("No JSON state file found at %s. Skipping seed.", STATE_PATH)
        return

    logger.info("Reading state from %s...", STATE_PATH)
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        logger.error("Failed to read JSON state: %s", e)
        return

    if not data:
        logger.info("JSON state file is empty. Skipping.")
        return

    db = SessionChatbot()
    repo = IngestionStateRepository(db)

    records = []
    for key, content_hash in data.items():
        # Determine EntityType based on key prefix convention used in ingest_tickets.py
        entity_type = "raw_ticket" if key.startswith("raw_") else "canonical_cluster"
        records.append({
            "EntityKey": key,
            "EntityType": entity_type,
            "ContentHash": content_hash
        })

    logger.info("Migrating %d records to SQL...", len(records))
    
    # Process in chunks to avoid massive single transactions if file is huge
    chunk_size = 500
    total_chunks = (len(records) + chunk_size - 1) // chunk_size

    for i in range(0, len(records), chunk_size):
        chunk = records[i:i+chunk_size]
        try:
            repo.bulk_upsert_state(chunk)
            current_chunk = (i // chunk_size) + 1
            logger.info("Uploaded chunk %d/%d", current_chunk, total_chunks)
        except Exception as e:
            logger.error("Failed to migrate chunk: %s", e)
            sys.exit(1)

    logger.info("Successfully migrated all state records from JSON to SQL.")
    logger.info("You can now safely delete %s (after verifying a dry run).", STATE_PATH)

if __name__ == "__main__":
    seed_state()
