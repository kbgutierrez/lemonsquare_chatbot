"""Pydantic schemas for the /chat endpoints."""

from pydantic import BaseModel, Field



class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1, max_length=4096)
    user_token: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    session_id: str
    response: str
    ticket_ids_used: list[int] = Field(default_factory=list)


class MessageRecord(BaseModel):
    MessageID: int
    SessionID: str
    SenderRole: str
    MessageContent: str
    CreatedAt: str  # ISO format string

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[MessageRecord]

from pydantic import BaseModel
from datetime import datetime

class ChatSessionMetaResponse(BaseModel):
    session_id: str
    status: str
    created_at: datetime | None
    message_count: int
    user_id: str | None = None  # Included so the Admin can see who started it


class ResolveChatResponse(BaseModel):
    status: str
    session_id: str | None = None
    message: str
