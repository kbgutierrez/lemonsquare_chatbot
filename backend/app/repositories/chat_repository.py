"""
Chat-related database operations.
Centralizes ALL ChatSession and ChatMessage queries.
Previously scattered across chat_service.py and router inline queries.
"""
import uuid
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.chatbot import ChatSession, ChatMessage
from app.core.exceptions import NotFoundError, AuthorizationError

logger = logging.getLogger(__name__)
HISTORY_WINDOW = 6


class ChatRepository:
    """Repository for chat session and message persistence."""

    def __init__(self, db: Session):
        self.db = db

    # ── Session Operations ─────────────────────────────────────

    def create_session(self, user_id: int) -> str:
        """Create a new active chat session for a user."""
        new_id = str(uuid.uuid4())
        session = ChatSession(
            SessionID=new_id,
            RequesterUserID=user_id,
            SessionStatus="Active",
            IsActive=True,
        )
        self.db.add(session)
        self.db.commit()
        logger.info("Created new chat session %s for user %d", new_id, user_id)
        return new_id

    def get_session_by_id(self, session_id: str) -> ChatSession | None:
        """Fetch a session by ID. Returns None if not found."""
        return self.db.query(ChatSession).filter(ChatSession.SessionID == session_id).first()

    def require_session(self, session_id: str) -> ChatSession:
        """Fetch a session, raising NotFoundError if missing."""
        session = self.get_session_by_id(session_id)
        if not session:
            raise NotFoundError(f"Chat session '{session_id}' not found.")
        return session

    def get_or_create_session(self, session_id, user_id: int) -> str:
        """Get existing session or create new one. Returns session ID string."""
        is_new = (
            not session_id
            or str(session_id).lower() == "null"
            or str(session_id).strip() == ""
        )
        if is_new:
            return self.create_session(user_id)

        normalized = str(session_id)
        existing = self.get_session_by_id(normalized)
        if not existing:
            raise NotFoundError(f"Chat session '{normalized}' not found.")
        return normalized

    def archive_session(self, session_id: str) -> None:
        """Soft-delete (archive) a session."""
        session = self.require_session(session_id)
        session.IsActive = False
        session.SessionStatus = "Archived"
        self.db.commit()
        logger.info("Session %s archived.", session_id)

    def archive_all_user_sessions(self, requester_id: int) -> int:
        """Archive all active sessions for a user. Returns count archived."""
        sessions = (
            self.db.query(ChatSession)
            .filter(ChatSession.RequesterUserID == requester_id)
            .filter(ChatSession.IsActive == True)
            .all()
        )
        for session in sessions:
            session.IsActive = False
            session.SessionStatus = "Archived"
        self.db.commit()
        return len(sessions)

    def resolve_session(self, session_id: str) -> None:
        """Mark a session as resolved."""
        session = self.require_session(session_id)
        session.SessionStatus = "Resolved"
        self.db.commit()

    def escalate_session(self, session_id: str) -> None:
        """Mark a session as escalated."""
        session = self.require_session(session_id)
        session.SessionStatus = "Escalated"
        self.db.commit()

    def verify_session_owner(self, session_id: str, user_id: int) -> ChatSession:
        """Verify a user owns a session. Raises on mismatch."""
        session = self.require_session(session_id)
        if str(session.RequesterUserID) != str(user_id):
            raise AuthorizationError("This chat session belongs to another user.")
        return session

    def validate_session_for_escalation(self, session_id: str) -> ChatSession:
        """Validate a session can be escalated. Raises ValidationError if not."""
        from app.core.exceptions import ValidationError
        session = self.require_session(session_id)
        if not session.IsActive:
            raise ValidationError("Archived sessions cannot be escalated.")
        current = (session.SessionStatus or "Active").strip()
        if current in {"Resolved", "Escalated", "Archived"}:
            raise ValidationError(f"Cannot escalate a '{current}' session.")
        return session

    # ── Message Operations ─────────────────────────────────────

    def save_message(self, session_id: str, role: str, content: str) -> None:
        """Save a chat message and update session last active."""
        self.db.add(ChatMessage(
            SessionID=session_id,
            SenderRole=role,
            MessageContent=content,
        ))
        session = self.get_session_by_id(session_id)
        if session:
            session.LastActive = None
        self.db.commit()

    def get_recent_history_text(self, session_id: str) -> str:
        """Get the last N messages formatted for context."""
        messages = (
            self.db.query(ChatMessage)
            .filter(ChatMessage.SessionID == session_id)
            .order_by(ChatMessage.CreatedAt.desc())
            .limit(HISTORY_WINDOW)
            .all()
        )
        messages.reverse()
        history = messages[:-1] if len(messages) > 1 else []
        return "\n".join(
            f"{msg.SenderRole}: {msg.MessageContent}"
            for msg in history
        )

    def get_all_messages(self, session_id: str) -> list[ChatMessage]:
        """Get all messages in a session, oldest first."""
        return (
            self.db.query(ChatMessage)
            .filter(ChatMessage.SessionID == session_id)
            .order_by(ChatMessage.CreatedAt.asc())
            .all()
        )

    def get_message_count(self, session_id: str) -> int:
        """Count messages in a session."""
        return (
            self.db.query(func.count(ChatMessage.MessageID))
            .filter(ChatMessage.SessionID == session_id)
            .scalar()
            or 0
        )

    # ── Session Listing ────────────────────────────────────────

    def list_user_sessions(self, requester_id: str, limit: int = 20) -> list[tuple]:
        """List active sessions for a user with message counts."""
        return (
            self.db.query(
                ChatSession.SessionID,
                ChatSession.SessionStatus,
                ChatSession.StartTime,
                ChatSession.RequesterUserID,
                func.count(ChatMessage.MessageID).label("message_count"),
            )
            .outerjoin(ChatMessage, ChatSession.SessionID == ChatMessage.SessionID)
            .filter(ChatSession.RequesterUserID == requester_id)
            .filter(ChatSession.IsActive == True)
            .group_by(
                ChatSession.SessionID,
                ChatSession.SessionStatus,
                ChatSession.StartTime,
                ChatSession.RequesterUserID,
            )
            .order_by(ChatSession.StartTime.desc())
            .limit(limit)
            .all()
        )

    def list_all_sessions(self, limit: int = 50) -> list[tuple]:
        """List all sessions with message counts."""
        return (
            self.db.query(
                ChatSession.SessionID,
                ChatSession.SessionStatus,
                ChatSession.StartTime,
                ChatSession.RequesterUserID,
                func.count(ChatMessage.MessageID).label("message_count"),
            )
            .outerjoin(ChatMessage, ChatSession.SessionID == ChatMessage.SessionID)
            .group_by(
                ChatSession.SessionID,
                ChatSession.SessionStatus,
                ChatSession.StartTime,
                ChatSession.RequesterUserID,
            )
            .order_by(ChatSession.StartTime.desc())
            .limit(limit)
            .all()
        )

    # ── Analytics ──────────────────────────────────────────────

    def count_active_sessions(self) -> int:
        return self.db.query(ChatSession).filter(ChatSession.IsActive == True).count()

    def count_escalated_sessions(self) -> int:
        return (
            self.db.query(ChatSession)
            .filter(ChatSession.SessionStatus == "Escalated")
            .filter(ChatSession.IsActive == True)
            .count()
        )
