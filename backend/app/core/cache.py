import time
import logging
import threading
from typing import Optional
from sqlalchemy.orm import Session
from app.models.chatbot import AIChatbotSetting

logger = logging.getLogger(__name__)


def _snapshot_settings(settings: AIChatbotSetting | None) -> AIChatbotSetting | None:
    """Copy loaded column values into a detached settings object safe for caching."""
    if settings is None:
        return None

    snapshot = AIChatbotSetting()
    for column in AIChatbotSetting.__table__.columns:
        setattr(snapshot, column.name, getattr(settings, column.name))
    return snapshot

class SettingsCache:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SettingsCache, cls).__new__(cls)
            cls._instance._cached_settings = None
            cls._instance._last_fetch = 0.0
            cls._instance._ttl = 300
            cls._instance._lock = threading.RLock()
        return cls._instance

    def get_settings(self, db: Session) -> Optional[AIChatbotSetting]:
        now = time.time()
        if self._cached_settings is not None and (now - self._last_fetch) <= self._ttl:
            return self._cached_settings

        with self._lock:
            now = time.time()
            if self._cached_settings is not None and (now - self._last_fetch) <= self._ttl:
                return self._cached_settings

            logger.info("Settings cache miss or expired; fetching active settings.")
            try:
                from app.repositories.settings_repository import SettingsRepository

                repo = SettingsRepository(db)
                self._cached_settings = _snapshot_settings(
                    repo.get_active_settings_uncached()
                )
                self._last_fetch = now
            except Exception as e:
                logger.error("Error refreshing settings cache: %s", e)
                return self._cached_settings
        return self._cached_settings

    def invalidate(self):
        logger.info("Invalidating settings cache.")
        with self._lock:
            self._cached_settings = None
            self._last_fetch = 0.0

settings_cache = SettingsCache()
