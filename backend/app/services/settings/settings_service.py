"""
AI settings management service — REFACTORED.
Uses SettingsRepository for all DB operations.
"""
import logging
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError
from app.models.chatbot import AIChatbotSetting
from app.repositories.settings_repository import SettingsRepository
from app.schemas.settings import SettingsUpdate

logger = logging.getLogger(__name__)


def get_active_settings(db: Session) -> AIChatbotSetting:
    """Return the currently active AI configuration row."""
    return SettingsRepository(db).require_active_settings()


def update_settings(
    db: Session,
    new_settings: SettingsUpdate,
    updated_by: int,
) -> AIChatbotSetting:
    """
    Archive current settings and create a new active row.
    Preserves full audit trail.
    """
    repo = SettingsRepository(db)
    return repo.create_new_active_settings(
        source=None,
        updated_by=updated_by,
        ActiveModel=new_settings.ActiveModel,
        ReformulatorModel=new_settings.ReformulatorModel,
        SystemPrompt=new_settings.SystemPrompt,
        ReformulatorPrompt=new_settings.ReformulatorPrompt,
        Temperature=new_settings.Temperature,
        ConfidenceThreshold=new_settings.ConfidenceThreshold,
        EmbeddingModel=new_settings.EmbeddingModel,
        RerankerModel=new_settings.RerankerModel,
        TopK_Tickets=new_settings.TopK_Tickets,
        UseReformulator=new_settings.UseReformulator,
        UseReranker=new_settings.UseReranker,
        AllowedCategories=new_settings.AllowedCategories,
        ChatExtractionPrompt=new_settings.ChatExtractionPrompt,
        EscalationDraftModel=new_settings.EscalationDraftModel,
        EscalationDraftPrompt=new_settings.EscalationDraftPrompt,

        RoutingModel=new_settings.RoutingModel,
        RoutingPrompt=new_settings.RoutingPrompt,

        DocumentClassifierModel=new_settings.DocumentClassifierModel,
        DocumentClassifierPrompt=new_settings.DocumentClassifierPrompt,

        ConversationResolutionModel=new_settings.ConversationResolutionModel,
        ConversationResolutionPrompt=new_settings.ConversationResolutionPrompt,
    )


def restore_default_settings(db: Session, updated_by: int) -> AIChatbotSetting:
    """Restore settings from system defaults (SettingID = 2)."""
    repo = SettingsRepository(db)
    default_config = repo.get_settings_by_id(2)
    if not default_config:
        raise NotFoundError("System default settings (ID 2) not found.")
    return repo.create_new_active_settings(source=default_config, updated_by=updated_by)
