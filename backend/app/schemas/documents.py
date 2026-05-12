"""Pydantic schemas for document management endpoints."""

from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    document_id: str
    file_name: str
    category: str
    chunk_count: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    status: str
    document_id: str
    category: str
    chunks_processed: int


class DocumentDeleteResponse(BaseModel):
    status: str
    document_id: str
