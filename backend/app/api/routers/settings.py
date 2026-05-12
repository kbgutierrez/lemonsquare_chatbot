"""
AI settings endpoints.

WHY the duplicate routes are gone:
  The original main.py had four settings endpoints:
    GET  /api/settings        → identical to →  GET  /api/settings/ai
    POST /api/settings        → identical to →  POST /api/settings/ai/update

  Having two URLs for the same resource violates REST principles and
  means any bug fix needs to be applied twice. The unified routes here are:
    GET  /api/settings     — fetch active config
    POST /api/settings     — update config

  If the old URLs were in use by a frontend, add aliases in main.py or
  keep them temporarily with a deprecation note.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services import settings_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["Settings"])

# TODO: Replace with actual admin authentication dependency once
# admin auth is implemented. For now, a placeholder user ID is used.
_PLACEHOLDER_ADMIN_ID = 1


@router.get(
    "",
    response_model=SettingsResponse,
    summary="Fetch active AI configuration",
)
def get_active_settings(
    db: Session = Depends(get_chatbot_db),
) -> SettingsResponse:
    """
    Return the currently active AI model configuration.

    Raises 404 if no active configuration exists in the database.
    """
    config = settings_service.get_active_settings(db)
    return SettingsResponse.model_validate(config)


@router.post(
    "",
    response_model=SettingsResponse,
    summary="Update AI configuration",
)
def update_active_settings(
    new_settings: SettingsUpdate,
    db: Session = Depends(get_chatbot_db),
) -> SettingsResponse:
    """
    Archive the current settings and activate a new configuration.

    All previous settings rows are preserved with IsActive=False for
    audit/rollback purposes.
    """
    config = settings_service.update_settings(
        db,
        new_settings,
        updated_by=_PLACEHOLDER_ADMIN_ID,
    )
    logger.info("Settings updated: model=%s", new_settings.ActiveModel)
    return SettingsResponse.model_validate(config)
