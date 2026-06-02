"""
Repository for tracking ticket and cluster ingestion state in SQL.
Replaces the local .ticket_cluster_state.json file.
"""
import logging
import time
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from app.models.chatbot import IngestionSyncState

logger = logging.getLogger(__name__)


class IngestionStateRepository:
    """Handles persistence of ingestion hashes to prevent redundant processing."""

    def __init__(self, db: Session):
        self.db = db

    def get_all_state(self) -> dict[str, str]:
        """
        Fetches all stored entity keys and hashes.
        Returns a dict of {EntityKey: ContentHash} for fast O(1) lookups.
        """
        results = self.db.execute(
            select(IngestionSyncState.EntityKey, IngestionSyncState.ContentHash)
        ).all()
        return {row.EntityKey: row.ContentHash for row in results}

    def bulk_upsert_state(self, records: list[dict], max_retries: int = 3) -> None:
        """
        Atomically updates or inserts multiple state records.
        Uses SQL Server MERGE for atomic upserts when possible, and falls back
        to a safe retry loop for other dialects.
        """
        records = self._dedupe_records(records)
        if not records:
            return

        if self.db.bind and self.db.bind.dialect.name == "mssql":
            self._sql_server_merge_upsert(records)
            return

        for attempt in range(max_retries):
            try:
                keys = [r["EntityKey"] for r in records]
                existing = self.db.query(IngestionSyncState).filter(
                    IngestionSyncState.EntityKey.in_(keys)
                ).all()

                existing_map = {obj.EntityKey: obj for obj in existing}

                for data in records:
                    key = data["EntityKey"]
                    if key in existing_map:
                        obj = existing_map[key]
                        obj.ContentHash = data["ContentHash"]
                        obj.EntityType = data["EntityType"]
                        obj.LastSyncedAt = datetime.utcnow()
                    else:
                        new_state = IngestionSyncState(
                            EntityKey=data["EntityKey"],
                            EntityType=data["EntityType"],
                            ContentHash=data["ContentHash"],
                            LastSyncedAt=datetime.utcnow(),
                        )
                        self.db.add(new_state)

                self.db.commit()
                logger.info("Successfully upserted %d ingestion state records to SQL.", len(records))
                return

            except IntegrityError:
                self.db.rollback()
                logger.warning(
                    "IntegrityError during bulk upsert (attempt %d/%d). Likely a concurrent insert race condition. Retrying...",
                    attempt + 1,
                    max_retries,
                )
                time.sleep(0.5)
            except Exception as exc:
                self.db.rollback()
                logger.error("Failed to bulk upsert ingestion state: %s", exc)
                raise

        logger.error(
            "Failed to bulk upsert ingestion state after %d attempts due to concurrent conflicts.",
            max_retries,
        )
        raise RuntimeError(f"Could not upsert state after {max_retries} attempts.")

    def _dedupe_records(self, records: list[dict]) -> list[dict]:
        normalized: dict[str, dict] = {}
        for record in records:
            normalized[record["EntityKey"]] = {
                "EntityKey": record["EntityKey"],
                "EntityType": record["EntityType"],
                "ContentHash": record["ContentHash"],
            }
        return list(normalized.values())

    def _sql_server_merge_upsert(self, records: list[dict]) -> None:
        table = IngestionSyncState.__table__
        schema = f"[{table.schema}]" if table.schema else ""
        table_name = f"{schema}.[{table.name}]" if schema else f"[{table.name}]"

        values_list = []
        params: dict[str, object] = {}
        now = datetime.utcnow()

        for idx, record in enumerate(records):
            values_list.append(
                f"(:EntityKey{idx}, :EntityType{idx}, :ContentHash{idx}, :LastSyncedAt{idx})"
            )
            params[f"EntityKey{idx}"] = record["EntityKey"]
            params[f"EntityType{idx}"] = record["EntityType"]
            params[f"ContentHash{idx}"] = record["ContentHash"]
            params[f"LastSyncedAt{idx}"] = now

        values_sql = ",\n    ".join(values_list)

        sql = f"""
MERGE INTO {table_name} AS target
USING (VALUES
    {values_sql}
) AS source (EntityKey, EntityType, ContentHash, LastSyncedAt)
ON target.EntityKey = source.EntityKey
WHEN MATCHED THEN
    UPDATE SET
        ContentHash = source.ContentHash,
        EntityType = source.EntityType,
        LastSyncedAt = source.LastSyncedAt
WHEN NOT MATCHED BY TARGET THEN
    INSERT (EntityKey, EntityType, ContentHash, LastSyncedAt)
    VALUES (source.EntityKey, source.EntityType, source.ContentHash, source.LastSyncedAt);
"""

        self.db.execute(text(sql), params)
        self.db.commit()
        logger.info("Successfully merged %d ingestion state records into SQL.", len(records))
