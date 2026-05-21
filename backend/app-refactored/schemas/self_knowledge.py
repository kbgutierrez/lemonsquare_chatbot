from pydantic import BaseModel
from typing import Any


class AIKnowledgeItem(BaseModel):
    id: str
    doc_type: str
    source: str | None = None
    category: str | None = None
    content: str | dict[str, Any]


class LearnedChatUpdateRequest(BaseModel):
    issue_reported: str | None = None
    issue_found: str | None = None
    issue_cause: str | None = None
    work_done: str | None = None
