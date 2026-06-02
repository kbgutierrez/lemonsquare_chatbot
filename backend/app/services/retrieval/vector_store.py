"""
Vector store service for Qdrant operations.
Encapsulates all Qdrant interactions — search, upsert, delete.
Previously embedded directly in the orchestrator and ingestion service.
"""
import logging
import asyncio
import time
from functools import lru_cache
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from qdrant_client.http.models import PayloadSchemaType, PointStruct
from app.core.config import settings
from app.core.metadata_contract import (
    DOC_TYPE_CANONICAL_TICKET,
    DOC_TYPE_GENERAL_TEXT,
    DOC_TYPE_OFFICIAL_DOCUMENT,
    DOC_TYPE_RESOLVED_CHAT,
    normalize_metadata,
)

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_shared_qdrant_client() -> QdrantClient:
    """Return one process-local Qdrant client instead of recreating clients per service."""
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
        timeout=settings.QDRANT_TIMEOUT,
    )


class VectorStoreService:
    """Service layer for Qdrant vector database operations."""

    def __init__(self, collection_name: str | None = None):
        self.qdrant = get_shared_qdrant_client()
        self.collection_name = collection_name or settings.QDRANT_COLLECTION

    @staticmethod
    def _active_condition():
        return qdrant_models.FieldCondition(
            key="metadata.is_active",
            match=qdrant_models.MatchValue(value=True),
        )

    def _typed_active_filter(self, doc_types: list[str]) -> qdrant_models.Filter:
        return qdrant_models.Filter(
            must=[
                qdrant_models.FieldCondition(
                    key="metadata.doc_type",
                    match=qdrant_models.MatchAny(any=doc_types),
                ),
                self._active_condition(),
            ],
        )

    def backfill_active_metadata(self, batch_size: int = 256) -> int:
        """
        Ensure existing vectors have metadata.is_active=True.
        This preserves old vectors after moving retrieval to strict active filtering.
        """
        updated_count = 0
        offset = None
        while True:
            points, offset = self.qdrant.scroll(
                collection_name=self.collection_name,
                limit=batch_size,
                offset=offset,
                with_payload=True,
                with_vectors=True,
            )
            if not points:
                break

            updated = []
            for point in points:
                payload = dict(getattr(point, "payload", {}) or {})
                raw_metadata = payload.get("metadata", {})
                raw_metadata = raw_metadata if isinstance(raw_metadata, dict) else {}
                if "is_active" in raw_metadata:
                    continue
                metadata = normalize_metadata(raw_metadata)
                metadata["is_active"] = True
                payload["metadata"] = metadata
                updated.append(PointStruct(id=point.id, vector=point.vector, payload=payload))

            if updated:
                self.upsert_points(updated)
                updated_count += len(updated)

            if offset is None:
                break

        if updated_count:
            logger.info("Backfilled metadata.is_active=True on %d Qdrant points.", updated_count)
        return updated_count

    def prepare_collection(self) -> None:
        """Prepare existing Qdrant collection for indexed soft/hard-delete filtering."""
        from qdrant_client.http.models import PayloadSchemaType
        
        # 1. Create the Payload Indices required for Hard Deletes & Factory Resets
        try:
            self.qdrant.create_payload_index(
                collection_name=self.collection_name,
                field_name="metadata.knowledge_type",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            self.qdrant.create_payload_index(
                collection_name=self.collection_name,
                field_name="metadata.source_id",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            # Add index for source_ids (used in ticket deletion)
            self.qdrant.create_payload_index(
                collection_name=self.collection_name,
                field_name="metadata.source_ids",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            # Add index for ticket_number (used in ticket deletion)
            self.qdrant.create_payload_index(
                collection_name=self.collection_name,
                field_name="metadata.ticket_number",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            self.qdrant.create_payload_index(
                collection_name=self.collection_name,
                field_name="metadata.is_active",
                field_schema=PayloadSchemaType.BOOLEAN,
            )
            logger.info("Qdrant payload indices for hard deletes and active filtering created/verified.")
        except Exception as e:
            # It's safe to ignore if the index already exists
            logger.debug(f"Payload index setup note: {e}")

        # 2. Your existing backfill logic
        self.backfill_active_metadata()

    def search_tickets(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list:
        """Search ticket-like vectors (raw, canonical, resolved chats)."""
        started = time.perf_counter()
        response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=self._typed_active_filter([
                "raw_ticket",
                DOC_TYPE_CANONICAL_TICKET,
                DOC_TYPE_RESOLVED_CHAT,
            ]),
            with_payload=True,
            limit=limit,
        )
        logger.info(
            "qdrant.search collection=%s kind=tickets latency_ms=%d result_count=%d",
            self.collection_name,
            int((time.perf_counter() - started) * 1000),
            len(response.points),
        )
        return response.points

    def search_documents(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list:
        """Search document-like vectors (PDFs, manual entries)."""
        started = time.perf_counter()
        response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=self._typed_active_filter([
                DOC_TYPE_OFFICIAL_DOCUMENT,
                DOC_TYPE_GENERAL_TEXT,
            ]),
            with_payload=True,
            limit=limit,
        )
        logger.info(
            "qdrant.search collection=%s kind=documents latency_ms=%d result_count=%d",
            self.collection_name,
            int((time.perf_counter() - started) * 1000),
            len(response.points),
        )
        return response.points

    def federated_search(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list:
        """Search both tickets and documents, returning combined results."""
        tickets = self.search_tickets(query_vector, limit)
        docs = self.search_documents(query_vector, limit)
        return tickets + docs

    async def federated_search_async(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list:
        """Search tickets and documents concurrently without changing result shape."""
        tickets, docs = await asyncio.gather(
            asyncio.to_thread(self.search_tickets, query_vector, limit),
            asyncio.to_thread(self.search_documents, query_vector, limit),
        )
        return tickets + docs

    def delete_by_filter(self, filter_conditions: list) -> None:
        """Delete points matching filter conditions."""
        self.qdrant.delete(
            collection_name=self.collection_name,
            points_selector=qdrant_models.Filter(must=filter_conditions),
        )

    def delete_points(self, point_ids: list) -> None:
        """Delete points by their IDs."""
        self.qdrant.delete(
            collection_name=self.collection_name,
            points_selector=point_ids,
        )

    def upsert_points(self, points: list) -> None:
        """Upsert points into the collection."""
        for point in points:
            payload = getattr(point, "payload", None)
            if isinstance(payload, dict):
                payload["metadata"] = normalize_metadata(payload.get("metadata", {}))
        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=points,
        )

    def set_payload_by_filter(self, filter_conditions: list, payload: dict) -> None:
        """Set payload fields on all points matching filter conditions."""
        self.qdrant.set_payload(
            collection_name=self.collection_name,
            payload=payload,
            points=qdrant_models.Filter(must=filter_conditions),
        )

    def update_metadata_by_filter(self, filter_conditions: list, metadata_updates: dict) -> None:
        """Update nested metadata fields without depending on dotted payload semantics."""
        filter_selector = qdrant_models.Filter(must=filter_conditions)
        for key, value in metadata_updates.items():
            self.qdrant.set_payload(
                collection_name=self.collection_name,
                payload={key: value},
                points=filter_selector,
                key="metadata",
            )

    def soft_delete_by_metadata(self, key: str, value) -> None:
        """Mark matching vectors inactive without removing them from Qdrant."""
        self._set_metadata_active_by_filter(key, value, is_active=False)

    def restore_by_metadata(self, key: str, value) -> None:
        """Mark matching vectors active again."""
        self._set_metadata_active_by_filter(key, value, is_active=True)

    def _set_metadata_active_by_filter(self, key: str, value, is_active: bool) -> None:
        filter_selector = qdrant_models.Filter(
            must=[
                qdrant_models.FieldCondition(
                    key=f"metadata.{key}",
                    match=qdrant_models.MatchValue(value=value),
                )
            ]
        )
        self.qdrant.set_payload(
            collection_name=self.collection_name,
            payload={"is_active": is_active},
            points=filter_selector,
            key="metadata",
        )

    def delete_ticket_vectors(self, ticket_number: str) -> None:
        """Physically deletes all vector chunks associated with a ticket number."""
        normalized_ticket = str(ticket_number)
        
        # Use a single delete command with an OR (should) filter
        self.qdrant.delete(
            collection_name=self.collection_name,
            points_selector=qdrant_models.Filter(
                should=[
                    qdrant_models.FieldCondition(
                        key="metadata.ticket_number",
                        match=qdrant_models.MatchValue(value=normalized_ticket),
                    ),
                    qdrant_models.FieldCondition(
                        key="metadata.source_id",
                        match=qdrant_models.MatchValue(value=normalized_ticket),
                    ),
                    qdrant_models.FieldCondition(
                        key="metadata.source_ids",
                        match=qdrant_models.MatchValue(value=normalized_ticket),
                    ),
                ]
            ),
        )

    def _set_metadata_active_by_filter_condition(
        self,
        condition,
        is_active: bool,
    ) -> None:
        self.qdrant.set_payload(
            collection_name=self.collection_name,
            payload={"is_active": is_active},
            points=qdrant_models.Filter(must=[condition]),
            key="metadata",
        )

    # ── Physical Deletion Operations ───────────────────────────

    def hard_delete_by_source_id(self, source_id: str) -> None:
        """Permanently deletes all vector chunks belonging to a document/entry."""
        self.delete_by_filter([
            qdrant_models.FieldCondition(
                key="metadata.source_id",
                match=qdrant_models.MatchValue(value=source_id)
            )
        ])

    def wipe_all_except_tickets(self) -> None:
        """Deletes all vectors EXCEPT those originating from the Helpdesk Sync."""
        from app.core.metadata_contract import KNOWLEDGE_TYPE_TICKET

        self.qdrant.delete(
            collection_name=self.collection_name,
            points_selector=qdrant_models.Filter(
                must_not=[
                    qdrant_models.FieldCondition(
                        key="metadata.knowledge_type",
                        match=qdrant_models.MatchValue(value=KNOWLEDGE_TYPE_TICKET)
                    )
                ]
            ),
        )


@lru_cache(maxsize=1)
def get_shared_vector_store(collection_name: str | None = None) -> VectorStoreService:
    """Return a shared vector store service for the configured collection."""
    resolved_name = collection_name or settings.QDRANT_COLLECTION
    return VectorStoreService(resolved_name)
