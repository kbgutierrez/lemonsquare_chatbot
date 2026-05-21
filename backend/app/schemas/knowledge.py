"""
Schemas for Knowledge Base Explorer API.
"""

from pydantic import BaseModel
from typing import Any


class KnowledgeExplorerResponse(BaseModel):
    """Single knowledge entry returned by the explorer endpoint."""
    id: str
    doc_type: str
    source: str | None = None
    category: str | None = None
    content: str | dict[str, Any]  # Can be raw text or extracted JSON
