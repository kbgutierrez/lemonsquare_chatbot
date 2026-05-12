"""Pydantic schemas for ticket management endpoints."""

from pydantic import BaseModel


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
    issue_resported: str  
    issue_found: str
    issue_cause: str
    work_done: str

class TicketSyncResponse(BaseModel):
    status: str
    ticket_number: str
    message: str

