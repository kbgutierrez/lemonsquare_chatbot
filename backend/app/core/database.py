"""
Database engine and session factory configuration.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

engine_helpdesk = create_engine(
    settings.HELPDESK_DB_CONN,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionHelpdesk = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_helpdesk,
)

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
    db = SessionChatbot()
    try:
        yield db
    finally:
        db.close()


def get_helpdesk_db() -> Session:
    db = SessionHelpdesk()
    try:
        yield db
    finally:
        db.close()
