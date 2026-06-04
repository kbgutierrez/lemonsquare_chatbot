"""Pydantic schemas for document management endpoints."""
from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    document_id: str
    file_name: str
    category: str
    chunk_count: int
    uploaded_at: str
    is_active: bool = True
    uploaded_by: int | None = None
    uploaded_by_username: str | None = None
    updated_at: str | None = None
    updated_by: int | None = None
    updated_by_username: str | None = None

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    status: str
    document_id: str
    category: str
    chunks_processed: int
    job_id: str | None = None


class DocumentDeleteResponse(BaseModel):
    status: str
    document_id: str


class ManualEntryRequest(BaseModel):
    title: str
    content: str
    category: str | None = None


class ManualEntryResponse(BaseModel):
    entry_id: str
    title: str
    content: str
    category: str

    created_at: str
    updated_at: str

    is_active: bool | None = None

    created_by: int | None = None
    created_by_username: str | None = None

    updated_by: int | None = None
    updated_by_username: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True


class ManualEntryUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None


class DocumentUpdateRequest(BaseModel):
    file_name: str | None = None
    category: str | None = None