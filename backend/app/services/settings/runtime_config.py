"""
Runtime AI configuration access layer.

Centralizes:
- active AI settings loading
- workflow-specific fallback logic
- future cache insertion point

This prevents workflow services from:
- directly querying SQL
- duplicating fallback logic
- hardcoding models/prompts
"""

from sqlalchemy.orm import Session




from app.repositories.settings_repository import SettingsRepository
from app.services.prompts import (
    ESCALATION_DRAFT_PROMPT,
    CONVERSATION_RESOLUTION_PROMPT,
    build_document_classifier_prompt,

)


DEFAULT_ROUTING_MODEL = "llama-3.1-8b-instant"
DEFAULT_DOCUMENT_CLASSIFIER_MODEL = "llama-3.1-8b-instant"
DEFAULT_ESCALATION_MODEL = "llama-3.1-8b-instant"
DEFAULT_CONVERSATION_RESOLUTION_MODEL = "llama-3.1-8b-instant"


class RuntimeAIConfig:

    def __init__(self, db: Session):
        self.settings = SettingsRepository(db).require_active_settings()

    @property
    def routing_model(self) -> str:
        return (
            self.settings.RoutingModel
            or DEFAULT_ROUTING_MODEL
        )

    @property
    def routing_prompt(self) -> str:
        return (
            self.settings.RoutingPrompt
            or ""
        )

    @property
    def escalation_draft_model(self) -> str:
        return (
            self.settings.EscalationDraftModel
            or DEFAULT_ESCALATION_MODEL
        )

    @property
    def escalation_draft_prompt(self) -> str:
        return (
            self.settings.EscalationDraftPrompt
            or ESCALATION_DRAFT_PROMPT
        )

    @property
    def document_classifier_model(self) -> str:
        return (
            self.settings.DocumentClassifierModel
            or DEFAULT_DOCUMENT_CLASSIFIER_MODEL
        )

    @property
    def document_classifier_prompt(self) -> str:
        return (
            self.settings.DocumentClassifierPrompt
            or build_document_classifier_prompt(snippet="{snippet}",allowed_categories="{allowed_categories}",)
        )

    @property
    def conversation_resolution_model(self) -> str:
        return (
            self.settings.ConversationResolutionModel
            or DEFAULT_CONVERSATION_RESOLUTION_MODEL
        )

    @property
    def conversation_resolution_prompt(self) -> str:
        return (
            self.settings.ConversationResolutionPrompt
            or CONVERSATION_RESOLUTION_PROMPT
        )
    
    