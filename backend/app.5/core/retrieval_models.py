"""
Normalized retrieval DTOs.

This layer isolates the orchestrator from raw Qdrant payload structure.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.core.metadata_contract import (
    DOCUMENT_DOC_TYPES,
    TICKET_LIKE_DOC_TYPES,
    normalize_metadata,
)


@dataclass
class RetrievalDocument:
    page_content: str
    metadata: dict[str, Any]
    score: float = 0.0

    @classmethod
    def from_qdrant(cls, hit) -> "RetrievalDocument":
        payload = getattr(hit, "payload", {}) or {}

        metadata = normalize_metadata(payload.get("metadata", {}))

        return cls(
            page_content=payload.get("page_content", ""),
            metadata=metadata,
            score=float(getattr(hit, "score", 0.0) or 0.0),
        )

    @property
    def doc_type(self) -> str:
        return self.metadata.get("doc_type", "unknown")

    @property
    def knowledge_type(self) -> str:
        return self.metadata.get("knowledge_type", "unknown")

    @property
    def category(self) -> str:
        return self.metadata.get("category", "General")

    @property
    def source_name(self) -> str:
        return (
            self.metadata.get("source")
            or self.metadata.get("file_name")
            or self.metadata.get("title")
            or self.metadata.get("ticket_number")
            or self.metadata.get("session_id")
            or "Unknown"
        )

    @property
    def source_id(self) -> str:
        return self.metadata.get("source_id", "")

    @property
    def cluster_key(self) -> str:
        return self.metadata.get("cluster_key", "")

    @property
    def frequency(self) -> int:
        return int(self.metadata.get("frequency", 1) or 1)

    @property
    def is_document(self) -> bool:
        return self.doc_type in DOCUMENT_DOC_TYPES

    @property
    def is_ticket_like(self) -> bool:
        return self.doc_type in TICKET_LIKE_DOC_TYPES

    def format_for_prompt(self) -> str:
        if self.is_document:
            return (
                f"[SOURCE: OFFICIAL DOCUMENT — {self.source_name} "
                f"| CATEGORY: {self.category}]\n"
                f"{self.page_content}"
            )

        return (
            f"[SOURCE: RESOLVED KNOWLEDGE]\n"
            f"{self.page_content}"
        )