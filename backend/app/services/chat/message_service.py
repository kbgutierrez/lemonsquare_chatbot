"""
Chat message handling and history management.
Extracted from chat_service.py.
"""
from sqlalchemy.orm import Session
from app.repositories.chat_repository import ChatRepository


class MessageService:
    """Handles message persistence and history retrieval."""

    def __init__(self, db: Session):
        self.repo = ChatRepository(db)

    def save_user_message(self, session_id: str, content: str, user_name: str | None = None) -> None:
        self.repo.save_message(session_id, "user", content, sender_name=user_name)

    def save_ai_message(self, session_id: str, content: str) -> None:
        self.repo.save_message(session_id, "ai", content, sender_name="Assistant")

    def get_history_text(self, session_id: str) -> str:
        return self.repo.get_recent_history_text(session_id)

    def get_all_messages(self, session_id: str):
        return self.repo.get_all_messages(session_id)

    def get_transcript(self, session_id: str) -> str:
        """Get full transcript formatted for escalation drafting."""
        messages = self.repo.get_all_messages(session_id)
        if not messages:
            return ""
        return "\n".join(
            f"{msg.SenderRole.upper()}: {msg.MessageContent}"
            for msg in messages
        )
