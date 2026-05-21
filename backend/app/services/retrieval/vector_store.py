"""
Vector store service for Qdrant operations.
Encapsulates all Qdrant interactions — search, upsert, delete.
Previously embedded directly in the orchestrator and ingestion service.
"""
import logging
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from app.core.config import settings
from app.core.metadata_contract import (
    DOC_TYPE_CANONICAL_TICKET,
    DOC_TYPE_GENERAL_TEXT,
    DOC_TYPE_OFFICIAL_DOCUMENT,
    DOC_TYPE_RESOLVED_CHAT,
)

logger = logging.getLogger(__name__)


class VectorStoreService:
    """Service layer for Qdrant vector database operations."""

    def __init__(self, collection_name: str | None = None):
        self.qdrant = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            timeout=settings.QDRANT_TIMEOUT,
        )
        self.collection_name = collection_name or settings.QDRANT_COLLECTION

    def search_tickets(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list:
        """Search ticket-like vectors (raw, canonical, resolved chats)."""
        response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchAny(any=[
                            "raw_ticket",
                            DOC_TYPE_CANONICAL_TICKET,
                            DOC_TYPE_RESOLVED_CHAT,
                        ]),
                    )
                ]
            ),
            with_payload=True,
            limit=limit,
        )
        return response.points

    def search_documents(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list:
        """Search document-like vectors (PDFs, manual entries)."""
        response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchAny(any=[
                            DOC_TYPE_OFFICIAL_DOCUMENT,
                            DOC_TYPE_GENERAL_TEXT,
                        ]),
                    )
                ]
            ),
            with_payload=True,
            limit=limit,
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
        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=points,
        )
