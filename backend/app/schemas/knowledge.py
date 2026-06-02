"""Schemas for Knowledge Base Explorer API."""
from pydantic import BaseModel
from typing import Any


class KnowledgeExplorerResponse(BaseModel):
    id: str
    doc_type: str
    source: str | None = None
    category: str | None = None
    content: str | dict[str, Any]


class SemanticFaqResponse(BaseModel):
    id: str
    source: str | None = None
    content: str
    frequency: int = 1
    ticket_count: int | None = None
    sample_ticket_number: str | None = None
