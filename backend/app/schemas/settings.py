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
    ChatExtractionModel: str | None
    ChatExtractionPrompt: str | None
    AllowedCategories: str = Field(..., min_length=1)
    EscalationDraftModel: str | None
    EscalationDraftPrompt: str | None

    RoutingModel: str | None
    RoutingPrompt: str | None

    DocumentClassifierModel: str | None
    DocumentClassifierPrompt: str | None

    ConversationResolutionModel: str | None
    ConversationResolutionPrompt: str | None


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
    ChatExtractionModel: str | None
    ChatExtractionPrompt: str | None
    UseReranker: bool | None
    AllowedCategories: str | None
    IsActive: bool

    EscalationDraftModel: str | None
    EscalationDraftPrompt: str | None

    RoutingModel: str | None
    RoutingPrompt: str | None

    DocumentClassifierModel: str | None
    DocumentClassifierPrompt: str | None

    ConversationResolutionModel: str | None
    ConversationResolutionPrompt: str | None
    UpdatedBy: int | None = None

    class Config:
        from_attributes = True


class ThemeSettingsUpdate(BaseModel):
    BubbleTheme: str = Field(default="lemon-square", max_length=50)
    HeaderGradientEnabled: bool = Field(default=True)
    CustomHeaderGradientStart: str = Field(default="#7BE38E", max_length=7)
    CustomHeaderGradientEnd: str = Field(default="#5dd87a", max_length=7)
    CustomAccent: str = Field(default="#22c55e", max_length=7)
    CustomWindowBg: str = Field(default="#f6fff7", max_length=7)


class ThemeSettingsResponse(BaseModel):
    BubbleTheme: str
    HeaderGradientEnabled: bool
    CustomHeaderGradientStart: str
    CustomHeaderGradientEnd: str
    CustomAccent: str
    CustomWindowBg: str

    class Config:
        from_attributes = True