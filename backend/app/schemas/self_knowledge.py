from pydantic import BaseModel
from typing import Any

class AIKnowledgeItem(BaseModel):
    id: str
    doc_type: str  # Will only ever be "resolved_chat" or "general_text"
    source: str | None = None
    category: str | None = None
    content: str | dict[str, Any]