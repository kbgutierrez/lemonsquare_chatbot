"""
Database engine and session factory configuration.

WHY this file exists separately from models/:
  Previously, engines, sessions, AND all ORM model classes were all
  defined in a single core/models.py. That file also imported from
  user_service.py, creating an upward dependency from the data layer
  to the service layer.

  Separating database setup here means:
  - ORM models (models/) have zero knowledge of configuration or services.
  - Services and routes import from models/ and core/database independently.
  - Tests can override get_chatbot_db / get_helpdesk_db without touching models.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


# ─── Helpdesk Database (Read-Only source of resolved tickets) ─────────────────
engine_helpdesk = create_engine(
    settings.HELPDESK_DB_CONN,
    pool_pre_ping=True,        # Reconnect gracefully after DB restarts
    pool_recycle=1800,         # Recycle connections every 30 min
)

SessionHelpdesk = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_helpdesk,
)


# ─── Chatbot Database (Read/Write for sessions, messages, settings, docs) ─────
engine_chatbot = create_engine(
    settings.CHATBOT_DB_CONN,
    pool_pre_ping=True,
    pool_recycle=1800,
)

SessionChatbot = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_chatbot,
)


def get_chatbot_db() -> Session:
    """
    FastAPI dependency that yields a chatbot DB session and ensures
    it is closed after the request, even if an exception occurs.
    """
    db = SessionChatbot()
    try:
        yield db
    finally:
        db.close()


def get_helpdesk_db() -> Session:
    """
    FastAPI dependency that yields a helpdesk DB session (read-only usage).
    """
    db = SessionHelpdesk()
    try:
        yield db
    finally:
        db.close()
