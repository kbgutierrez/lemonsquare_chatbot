"""
AI settings management service — REFACTORED.
Uses SettingsRepository for all DB operations.
"""
import logging
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError
from app.models.chatbot import AIChatbotSetting, UserThemePreference
from app.repositories.settings_repository import SettingsRepository
from app.schemas.settings import SettingsUpdate, ThemeSettingsUpdate

logger = logging.getLogger(__name__)


def get_active_settings(db: Session) -> AIChatbotSetting:
    """Return the currently active AI configuration row."""
    return SettingsRepository(db).require_active_settings()


def update_settings(
    db: Session,
    new_settings: SettingsUpdate,
    updated_by: int,
    updated_by_username: str | None = None,
) -> AIChatbotSetting:
    """
    Archive current settings and create a new active row.
    Preserves full audit trail.
    """
    repo = SettingsRepository(db)
    return repo.create_new_active_settings(
        source=None,
        updated_by=updated_by,
        updated_by_username=updated_by_username,

        AIName=new_settings.AIName,

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
        ChatExtractionModel=new_settings.ChatExtractionModel,
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


def restore_default_settings(db: Session, updated_by: int, updated_by_username: str | None = None) -> AIChatbotSetting:
    """Restore settings from system defaults (SettingID = 2)."""
    repo = SettingsRepository(db)
    default_config = repo.get_settings_by_id(2)
    if not default_config:
        raise NotFoundError("System default settings (ID 2) not found.")
    return repo.create_new_active_settings(source=default_config, updated_by=updated_by, updated_by_username=updated_by_username)


def get_user_theme(db: Session, user_id: int) -> UserThemePreference:
    """
    Get or create theme preference for a specific user.
    Falls back to global defaults from AIChatbot_Settings if user has no saved preference.
    """
    pref = db.query(UserThemePreference).filter(
        UserThemePreference.UserID == user_id
    ).first()

    if pref:
        return pref

    # No user preference yet — seed from global defaults
    global_defaults = SettingsRepository(db).require_active_settings()

    return UserThemePreference(
        UserID=user_id,
        BubbleTheme=global_defaults.BubbleTheme,
        HeaderGradientEnabled=global_defaults.HeaderGradientEnabled,
        CustomHeaderGradientStart=global_defaults.CustomHeaderGradientStart,
        CustomHeaderGradientEnd=global_defaults.CustomHeaderGradientEnd,
        CustomAccent=global_defaults.CustomAccent,
        CustomWindowBg=global_defaults.CustomWindowBg,
    )


def get_factory_defaults() -> dict:
    """
    Return hardcoded system defaults from the codebase.
    Used for 'Load Defaults' feature in Admin UI.
    """
    from app.core.config import settings
    from app.services.prompts import (
        DEFAULT_SYSTEM_PROMPT,
        DEFAULT_REFORMULATOR_PROMPT,
        ESCALATION_DRAFT_PROMPT,
        CONVERSATION_RESOLUTION_PROMPT,
        RESOLVED_CHAT_EXTRACTION_PROMPT,
        DEFAULT_ROUTING_PROMPT,
        build_document_classifier_prompt,
    )
    from app.services.settings.runtime_config import (
        DEFAULT_ROUTING_MODEL,
        DEFAULT_DOCUMENT_CLASSIFIER_MODEL,
        DEFAULT_ESCALATION_MODEL,
        DEFAULT_CONVERSATION_RESOLUTION_MODEL,
        DEFAULT_CHAT_EXTRACTION_MODEL,
    )

    # Replicate internal categories from PDFProcessor
    default_categories = [
        "General", 
        "Policies", 
        "Procedures", 
        "Software", 
        "Hardware",  
        "Network"
    ]

    return {
        "SettingID": 0,
        "AIName": "Cheesecake AI",
        "ActiveModel": "llama-3.3-70b-versatile",
        "ReformulatorModel": "llama-3.1-8b-instant",
        "SystemPrompt": DEFAULT_SYSTEM_PROMPT,
        "ReformulatorPrompt": DEFAULT_REFORMULATOR_PROMPT,
        "Temperature": 0.2,
        "ConfidenceThreshold": 0.15,
        "EmbeddingModel": settings.EMBEDDING_MODEL,
        "RerankerModel": settings.RERANKER_MODEL,
        "TopK_Tickets": 5,
        "UseReformulator": True,
        "UseReranker": False,
        "ChatExtractionModel": DEFAULT_CHAT_EXTRACTION_MODEL,
        "ChatExtractionPrompt": RESOLVED_CHAT_EXTRACTION_PROMPT,
        "AllowedCategories": ",".join(default_categories),
        "IsActive": True,

        "EscalationDraftModel": DEFAULT_ESCALATION_MODEL,
        "EscalationDraftPrompt": ESCALATION_DRAFT_PROMPT,
        "RoutingModel": DEFAULT_ROUTING_MODEL,
        "RoutingPrompt": DEFAULT_ROUTING_PROMPT,
        "DocumentClassifierModel": DEFAULT_DOCUMENT_CLASSIFIER_MODEL,
        "DocumentClassifierPrompt": build_document_classifier_prompt(
            snippet="{snippet}", 
            allowed_categories="{allowed_categories}"
        ),
        "ConversationResolutionModel": DEFAULT_CONVERSATION_RESOLUTION_MODEL,
        "ConversationResolutionPrompt": CONVERSATION_RESOLUTION_PROMPT,
    }


def update_user_theme(
    db: Session,
    user_id: int,
    theme_update: ThemeSettingsUpdate,
) -> UserThemePreference:
    """
    Upsert theme preference for a specific user.
    Creates row if none exists, updates if it does.
    """
    pref = db.query(UserThemePreference).filter(
        UserThemePreference.UserID == user_id
    ).first()

    if not pref:
        pref = UserThemePreference(UserID=user_id)
        db.add(pref)

    pref.BubbleTheme = theme_update.BubbleTheme
    pref.HeaderGradientEnabled = theme_update.HeaderGradientEnabled
    pref.CustomHeaderGradientStart = theme_update.CustomHeaderGradientStart
    pref.CustomHeaderGradientEnd = theme_update.CustomHeaderGradientEnd
    pref.CustomAccent = theme_update.CustomAccent
    pref.CustomWindowBg = theme_update.CustomWindowBg

    db.commit()
    db.refresh(pref)

    logger.info(
        "User theme updated: user_id=%s theme=%s",
        user_id,
        theme_update.BubbleTheme,
    )

    return pref