"""Pydantic schemas for ticket management endpoints."""
from uuid import UUID
from pydantic import BaseModel, Field


class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    issue_reported: str | None
    work_done: str | None
    is_blacklisted: bool


class TicketDeleteResponse(BaseModel):
    status: str
    message: str


class TicketResolveRequest(BaseModel):
    ticket_number: str
    issue_reported: str
    issue_found: str
    issue_cause: str
    work_done: str


class TicketSyncResponse(BaseModel):
    status: str
    ticket_number: str
    message: str


class TicketEscalateRequest(BaseModel):
    session_id: UUID
    requester_id: int
    company_id: int


class TicketEscalateResponse(BaseModel):
    status: str
    message: str
    bizportal_response: dict | str | None = None


class TicketDraftResponse(BaseModel):
    status: str
    summary: str | None = None
    description: str | None = None
    location: str | None = None
    equipment: str | None = None
    department_id: int | None = None
    subcategory_id: int | None = None
    department_name: str | None = None
    subcategory_name: str | None = None
    routing_reasoning: str | None = None
    routing_confidence: float | None = None
    routing_source: str | None = None
    pushback_message: str | None = None


class TicketSubmitRequest(BaseModel):
    session_id: UUID
    requester_id: int
    company_id: int
    summary: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=3)
    department_id: int
    subcategory_id: int
