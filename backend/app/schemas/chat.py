"""Pydantic schemas for the /chat endpoints."""
from datetime import datetime
from typing import Any
from uuid import UUID
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: UUID | None = None
    message: str = Field(..., min_length=1, max_length=4096)
    user_token: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    session_id: str
    response: str
    ticket_ids_used: list[int] = Field(default_factory=list)
    show_resolution_prompt: bool = False 
    allow_ticket_submission: bool = True
    conversation_status: str = "active"
    resolution_action: str = "active"
    resolution_confidence: float = 0.0
    resolution_message: str | None = None
    debug_info: dict[str, Any] | None = None


class MessageRecord(BaseModel):
    MessageID: int
    SessionID: str
    SenderRole: str
    SenderName: str | None = None
    MessageContent: str
    CreatedAt: str

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[MessageRecord]


class ChatSessionMetaResponse(BaseModel):
    session_id: str
    status: str
    created_at: datetime | None
    message_count: int
    user_id: str | None = None
    requester_name: str | None = None


class ResolveChatResponse(BaseModel):
    status: str
    session_id: str | None = None
    message: str


class ResolutionCheckResponse(BaseModel):
    show_resolution_prompt: bool
    allow_ticket_submission: bool
    conversation_status: str       
    resolution_action: str
    resolution_confidence: float
    resolution_message: str | None = None
