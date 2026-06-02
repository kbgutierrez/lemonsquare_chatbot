"""
Chat learning processor.
Extracts knowledge from resolved chat sessions for performance tracking.
Learned chats are saved to SQL only and are NOT pushed to Qdrant.
"""
import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.chatbot import ChatMessage, ChatSession, LearnedChat
from app.core.exceptions import ValidationError
from app.services.llm_client import create_llm, invoke_llm
from app.services.prompts import RESOLVED_CHAT_EXTRACTION_PROMPT
from app.utils.json_utils import safe_json_loads

logger = logging.getLogger(__name__)


class ChatLearningProcessor:
    def __init__(self, db: Session, vector_store=None, embeddings=None):
        self.db = db

    async def process(self, session_id: str) -> dict:
        session = self.db.query(ChatSession).filter(ChatSession.SessionID == session_id).first()
        if not session:
            return {"status": "error", "message": f"Session {session_id} not found."}

        messages = self.db.query(ChatMessage).filter(
            ChatMessage.SessionID == session_id
        ).order_by(ChatMessage.CreatedAt.asc()).all()
        if len(messages) < 2:
            return {"status": "skipped", "session_id": session_id, "message": "Chat is too short to learn from."}
        if not any((m.SenderRole or "").lower() == "ai" for m in messages):
            raise ValidationError("Resolved chats must include an AI response before they can be learned.")

        # Extract issue/resolution from messages
        transcript = "\n".join(f"{m.SenderRole}: {m.MessageContent}" for m in messages)

        # Create or update LearnedChat
        learned = self.db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not learned:
            learned = LearnedChat(
                SessionID=session_id,
                UserID=session.RequesterUserID,
                RequesterName=session.RequesterName,
            )
            self.db.add(learned)
        elif learned.IsActive:
            if not learned.RequesterName and session.RequesterName:
                learned.RequesterName = session.RequesterName
                try:
                    self.db.commit()
                except Exception:
                    self.db.rollback()
                    raise
            return {
                "status": "skipped",
                "session_id": session_id,
                "message": "Chat has already been logged.",
            }
        else:
            # Even if updating an existing inactive record, ensure UserID and RequesterName are set
            learned.UserID = session.RequesterUserID
            learned.RequesterName = session.RequesterName

        # Fetch dynamic settings
        from app.repositories.settings_repository import SettingsRepository
        config = SettingsRepository(self.db).get_active_settings()

        # Determine model and prompt with fallbacks
        model_name = (config.ChatExtractionModel if config and config.ChatExtractionModel else None) or settings.CLASSIFIER_MODEL
        prompt_template = (config.ChatExtractionPrompt if config and config.ChatExtractionPrompt else None) or RESOLVED_CHAT_EXTRACTION_PROMPT

        # Extract structured details from transcript using LLM
        try:
            llm = create_llm(model=model_name, temperature=0.1)
            prompt = prompt_template.format(transcript=transcript)
            llm_res = await invoke_llm(
                llm,
                prompt,
                model=model_name,
                action="extract_resolved_chat",
                session_id=session_id,
            )
            extracted = safe_json_loads(llm_res.content, context="ResolvedChatExtraction")

            if extracted and isinstance(extracted, dict):
                learned.IssueReported = extracted.get("issue_reported") or transcript[:500]
                learned.IssueFound = extracted.get("issue_found") or ""
                learned.RootCause = extracted.get("issue_cause") or ""
                learned.WorkDone = extracted.get("work_done") or "Resolved via chat"
            else:
                logger.warning("LLM extraction failed for session %s, using fallback.", session_id)
                learned.IssueReported = transcript[:500]
                learned.WorkDone = "Resolved via chat"
        except Exception as exc:
            logger.error("Error extracting details for session %s: %s. Falling back.", session_id, exc)
            learned.IssueReported = transcript[:500]
            learned.WorkDone = "Resolved via chat"

        learned.IsActive = True
        session.SessionStatus = "Resolved"

        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {
            "status": "success",
            "session_id": session_id,
            "message": "Chat resolved and logged for performance tracking.",
        }

    async def update(self, session_id: str, updates: dict) -> dict:
        learned = self.db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not learned:
            raise ValueError(f"Learned chat '{session_id}' not found.")
        if learned.IsActive is False:
            raise ValueError(f"Learned chat '{session_id}' is inactive. Restore it before updating.")

        for field in ["issue_reported", "issue_found", "issue_cause", "work_done"]:
            if field in updates and updates[field] is not None:
                setattr(learned, field.replace("issue_cause", "RootCause").replace("issue_reported", "IssueReported").replace("issue_found", "IssueFound").replace("work_done", "WorkDone"), updates[field])

        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {"status": "success", "message": f"Learned chat {session_id} updated."}

    async def delete(self, session_id: str) -> dict:
        learned = self.db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not learned:
            return {
                "status": "skipped",
                "session_id": session_id,
                "message": f"Learned chat {session_id} was not found.",
            }

        if learned.IsActive is False:
            return {
                "status": "skipped",
                "session_id": session_id,
                "message": f"Learned chat {session_id} is already inactive.",
            }

        learned.IsActive = False
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {
            "status": "success",
            "session_id": session_id,
            "message": f"Learned chat {session_id} was soft-deleted.",
        }

    async def restore(self, session_id: str) -> dict:
        learned = self.db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not learned:
            raise ValueError(f"Learned chat '{session_id}' not found.")
        if learned.IsActive is True:
            return {
                "status": "skipped",
                "session_id": session_id,
                "message": f"Learned chat {session_id} is already active.",
            }

        learned.IsActive = True
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {"status": "success", "message": f"Learned chat {session_id} restored."}

