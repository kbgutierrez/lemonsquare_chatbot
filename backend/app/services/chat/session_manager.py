"""
Chat session lifecycle management.
Extracted from chat_service.py — previously mixed with message handling,
escalation logic, and LLM prompting.
"""
import logging
from sqlalchemy.orm import Session
from app.repositories.chat_repository import ChatRepository
from app.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages chat session CRUD and lifecycle."""

    def __init__(self, db: Session):
        self.repo = ChatRepository(db)

    def get_or_create(self, session_id, user_id: int, user_name: str | None = None) -> str:
        return self.repo.get_or_create_session(session_id, user_id, requester_name=user_name)

    def archive(self, session_id: str) -> None:
        self.repo.archive_session(session_id)

    def archive_all_for_user(self, requester_id: int) -> int:
        return self.repo.archive_all_user_sessions(requester_id)

    def verify_ownership(self, session_id: str, user_id: int):
        self.repo.verify_session_owner(session_id, user_id)

    def validate_for_escalation(self, session_id: str):
        return self.repo.validate_session_for_escalation(session_id)
