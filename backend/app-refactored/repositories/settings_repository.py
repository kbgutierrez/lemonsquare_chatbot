"""
Settings database operations.
Centralizes AIChatbotSetting queries.
Previously duplicated inline in settings_service.py and orchestrator.py.
"""
import logging
from sqlalchemy.orm import Session
from app.models.chatbot import AIChatbotSetting
from app.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)


class SettingsRepository:
    """Repository for AI settings persistence."""

    def __init__(self, db: Session):
        self.db = db

    def get_active_settings(self) -> AIChatbotSetting | None:
        """Return the single active settings row, or None."""
        return (
            self.db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

    def require_active_settings(self) -> AIChatbotSetting:
        config = self.get_active_settings()
        if not config:
            raise NotFoundError("No active AI settings configuration found.")
        return config

    def get_settings_by_id(self, setting_id: int) -> AIChatbotSetting | None:
        return self.db.query(AIChatbotSetting).filter(AIChatbotSetting.SettingID == setting_id).first()

    def deactivate_all_settings(self) -> None:
        """Set IsActive=False on all settings rows."""
        self.db.query(AIChatbotSetting).filter(
            AIChatbotSetting.IsActive == True
        ).update({"IsActive": False})

    def add_settings(self, config: AIChatbotSetting) -> None:
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)

    def create_new_active_settings(
        self,
        source: AIChatbotSetting | None = None,
        updated_by: int = 1,
        **overrides,
    ) -> AIChatbotSetting:
        """
        Deactivate current settings and create a new active row.
        If source is provided, copy from it; otherwise use overrides.
        """
        self.deactivate_all_settings()

        new_config = AIChatbotSetting(
            ActiveModel=overrides.get("ActiveModel", source.ActiveModel if source else "llama-3.3-70b-versatile"),
            ReformulatorModel=overrides.get("ReformulatorModel", source.ReformulatorModel if source else None),
            SystemPrompt=overrides.get("SystemPrompt", source.SystemPrompt if source else "You are an IT Support Agent."),
            ReformulatorPrompt=overrides.get("ReformulatorPrompt", source.ReformulatorPrompt if source else None),
            Temperature=overrides.get("Temperature", source.Temperature if source else 0.2),
            ConfidenceThreshold=overrides.get("ConfidenceThreshold", source.ConfidenceThreshold if source else None),
            EmbeddingModel=overrides.get("EmbeddingModel", source.EmbeddingModel if source else None),
            RerankerModel=overrides.get("RerankerModel", source.RerankerModel if source else None),
            TopK_Tickets=overrides.get("TopK_Tickets", source.TopK_Tickets if source else 5),
            UseReformulator=overrides.get("UseReformulator", source.UseReformulator if source else True),
            UseReranker=overrides.get("UseReranker", source.UseReranker if source else True),
            AllowedCategories=overrides.get("AllowedCategories", source.AllowedCategories if source else None),
            ChatExtractionPrompt=overrides.get("ChatExtractionPrompt", source.ChatExtractionPrompt if source else None),
            IsActive=True,
            UpdatedBy=updated_by,
        )
        self.add_settings(new_config)
        return new_config
