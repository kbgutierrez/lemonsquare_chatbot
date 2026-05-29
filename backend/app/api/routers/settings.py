"""
AI settings router.
Thin HTTP layer — business logic in settings_service.
"""
import logging
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, require_admin_user
from app.schemas.settings import (
    SettingsResponse,
    SettingsUpdate,
    ThemeSettingsResponse,
    ThemeSettingsUpdate,
)
from app.services.settings.settings_service import (
    get_active_settings,
    update_settings,
    restore_default_settings,
    get_factory_defaults,
    get_user_theme,
    update_user_theme,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["Settings"])

_PLACEHOLDER_ADMIN_ID = 1


def resolve_user_id(x_user_token: str | None = Header(default=None, alias="X-User-Token")) -> int:
    """
    Resolve user ID from token header.
    Falls back to placeholder 11318 for SDK/dev mode.
    """
    if not x_user_token:
        return 11318

    try:
        return int(x_user_token)
    except (ValueError, TypeError):
        return 11318


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
    user_id = int(current_user.get("id", 1))
    config = update_settings(db, new_settings, updated_by=user_id)
    logger.info("Settings updated by user #%d: model=%s", user_id, new_settings.ActiveModel)
    return SettingsResponse.model_validate(config)


@router.post("/default", response_model=SettingsResponse, summary="Restore AI settings to system defaults")
def restore_settings_to_default(
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
) -> SettingsResponse:
    user_id = int(current_user.get("id", 1))
    config = restore_default_settings(db, updated_by=user_id)
    return SettingsResponse.model_validate(config)


@router.get("/factory-defaults", response_model=SettingsResponse, summary="Get hardcoded system defaults")
def get_factory_defaults_endpoint(
    current_user: dict = Depends(require_admin_user),
) -> SettingsResponse:
    defaults = get_factory_defaults()
    return SettingsResponse.model_validate(defaults)


@router.get("/theme", response_model=ThemeSettingsResponse, summary="Fetch user theme configuration")
def get_theme_settings_endpoint(
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_chatbot_db),
) -> ThemeSettingsResponse:
    config = get_user_theme(db, user_id)
    return ThemeSettingsResponse.model_validate(config)


@router.put("/theme", response_model=ThemeSettingsResponse, summary="Update user theme configuration")
def update_theme_settings_endpoint(
    theme_update: ThemeSettingsUpdate,
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_chatbot_db),
) -> ThemeSettingsResponse:
    config = update_user_theme(db, user_id, theme_update)
    logger.info(
        "Theme updated: user_id=%s theme=%s",
        user_id,
        theme_update.BubbleTheme,
    )
    return ThemeSettingsResponse.model_validate(config)