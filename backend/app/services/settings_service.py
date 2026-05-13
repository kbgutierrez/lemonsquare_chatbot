"""
AI settings management service.

WHY this service exists:
  The original main.py had two pairs of duplicate settings endpoints
  (GET /settings + GET /settings/ai, POST /settings + POST /settings/ai/update)
  each containing identical raw ORM logic. This service centralises that
  logic so the router calls one function, not duplicated inline code.
"""

import logging

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.chatbot import AIChatbotSetting
from app.schemas.settings import SettingsUpdate

logger = logging.getLogger(__name__)


def get_active_settings(db: Session) -> AIChatbotSetting:
    """
    Return the currently active AI configuration row.

    Raises:
        NotFoundError: If no active configuration exists.
    """
    config = (
        db.query(AIChatbotSetting)
        .filter(AIChatbotSetting.IsActive == True)
        .order_by(AIChatbotSetting.SettingID.desc())
        .first()
    )
    if not config:
        raise NotFoundError("No active AI settings configuration found.")
    return config


def update_settings(
    db: Session,
    new_settings: SettingsUpdate,
    updated_by: int,
) -> AIChatbotSetting:
    """
    Archive the current active settings and create a new active row.

    This preserves a full audit trail — old settings rows remain in the
    database with IsActive=False.

    Args:
        db: Database session.
        new_settings: Validated settings payload.
        updated_by: The user ID performing the update (for audit).

    Returns:
        The newly created active settings row.
    """
    # 1. Deactivate all currently active rows.
    db.query(AIChatbotSetting).filter(
        AIChatbotSetting.IsActive == True
    ).update({"IsActive": False})

    # 2. Insert the new active row.
    new_config = AIChatbotSetting(
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
        IsActive=True,
        UpdatedBy=updated_by,
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)

    logger.info(
        "AI settings updated by user %d: model=%s",
        updated_by,
        new_settings.ActiveModel,
    )
    return new_config
