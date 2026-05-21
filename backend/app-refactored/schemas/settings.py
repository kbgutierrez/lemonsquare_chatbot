"""Pydantic schemas for AI settings endpoints."""
from pydantic import BaseModel, Field


class SettingsUpdate(BaseModel):
    ActiveModel: str = Field(..., min_length=1)
    ReformulatorModel: str = Field(..., min_length=1)
    SystemPrompt: str = Field(..., min_length=1)
    ReformulatorPrompt: str = Field(..., min_length=1)
    Temperature: float = Field(..., ge=0.0, le=2.0)
    ConfidenceThreshold: float = Field(..., ge=-10.0, le=10.0)
    EmbeddingModel: str = Field(..., min_length=1)
    RerankerModel: str = Field(..., min_length=1)
    TopK_Tickets: int = Field(..., ge=1, le=20)
    UseReformulator: bool
    UseReranker: bool
    ChatExtractionPrompt: str | None
    AllowedCategories: str = Field(..., min_length=1)


class SettingsResponse(BaseModel):
    SettingID: int
    ActiveModel: str
    ReformulatorModel: str | None
    SystemPrompt: str
    ReformulatorPrompt: str | None
    Temperature: float | None
    ConfidenceThreshold: float | None
    EmbeddingModel: str | None
    RerankerModel: str | None
    TopK_Tickets: int | None
    UseReformulator: bool | None
    ChatExtractionPrompt: str | None
    UseReranker: bool | None
    AllowedCategories: str | None
    IsActive: bool

    class Config:
        from_attributes = True
