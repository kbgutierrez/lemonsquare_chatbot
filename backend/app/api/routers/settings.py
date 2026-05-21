"""
AI settings router.
Thin HTTP layer — business logic in settings_service.
"""
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, require_admin_user
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.settings.settings_service import (
    get_active_settings,
    update_settings,
    restore_default_settings,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["Settings"])

_PLACEHOLDER_ADMIN_ID = 1


@router.get("", response_model=SettingsResponse, summary="Fetch active AI configuration")
def get_active_settings_endpoint(
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
) -> SettingsResponse:
    config = get_active_settings(db)
    return SettingsResponse.model_validate(config)


@router.post("", response_model=SettingsResponse, summary="Update AI configuration")
def update_active_settings(
    new_settings: SettingsUpdate,
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
) -> SettingsResponse:
    config = update_settings(db, new_settings, updated_by=_PLACEHOLDER_ADMIN_ID)
    logger.info("Settings updated: model=%s", new_settings.ActiveModel)
    return SettingsResponse.model_validate(config)


@router.post("/default", response_model=SettingsResponse, summary="Restore AI settings to system defaults")
def restore_settings_to_default(
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
) -> SettingsResponse:
    config = restore_default_settings(db, updated_by=_PLACEHOLDER_ADMIN_ID)
    return SettingsResponse.model_validate(config)
