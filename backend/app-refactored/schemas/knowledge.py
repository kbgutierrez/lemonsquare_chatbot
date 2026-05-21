"""Schemas for Knowledge Base Explorer API."""
from pydantic import BaseModel
from typing import Any


class KnowledgeExplorerResponse(BaseModel):
    id: str
    doc_type: str
    source: str | None = None
    category: str | None = None
    content: str | dict[str, Any]
