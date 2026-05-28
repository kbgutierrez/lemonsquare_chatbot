"""
Chat learning processor.
Extracts knowledge from resolved chat sessions.
"""
import logging
from sqlalchemy.orm import Session
from qdrant_client.http.models import PointStruct
from app.core.config import settings
from app.models.chatbot import ChatMessage, ChatSession, LearnedChat
from app.core.exceptions import ValidationError, VectorStoreError
from app.services.llm_client import create_llm, invoke_llm
from app.services.prompts import RESOLVED_CHAT_EXTRACTION_PROMPT
from app.utils.json_utils import safe_json_loads
from app.services.consolidation.knowledge_consolidator import KnowledgeConsolidator

logger = logging.getLogger(__name__)


class ChatLearningProcessor:
    def __init__(self, db: Session, vector_store, embeddings):
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.consolidator = KnowledgeConsolidator()

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
            learned = LearnedChat(SessionID=session_id)
            self.db.add(learned)
        elif learned.IsActive:
            return {
                "status": "skipped",
                "session_id": session_id,
                "message": "Chat has already been learned.",
            }

        # Extract structured details from transcript using LLM
        try:
            llm = create_llm(model=settings.CLASSIFIER_MODEL, temperature=0.1)
            prompt = RESOLVED_CHAT_EXTRACTION_PROMPT.format(transcript=transcript)
            llm_res = await invoke_llm(
                llm,
                prompt,
                model=settings.CLASSIFIER_MODEL,
                action="extract_resolved_chat",
                session_id=session_id,
            )
            extracted = safe_json_loads(llm_res.content, context="ResolvedChatExtraction")

            if extracted and isinstance(extracted, dict):
                learned.IssueReported = extracted.get("issue_reported") or transcript[:500]
                learned.IssueFound = extracted.get("issue_found") or ""
                learned.RootCause = extracted.get("issue_cause") or "Unknown"
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

        record = self.consolidator.build_chat_record(
            session_id=session_id,
            issue_reported=learned.IssueReported,
            issue_found=learned.IssueFound,
            issue_cause=learned.RootCause,
            work_done=learned.WorkDone,
        )

        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, record.page_content)
        try:
            self.vector_store.upsert_points([PointStruct(
                id=record.point_id,
                vector=vector,
                payload={"page_content": record.page_content, "metadata": record.metadata}
            )])
        except Exception as exc:
            self.db.rollback()
            raise VectorStoreError(f"Failed to upsert learned chat to Qdrant: {exc}") from exc

        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            try:
                self.vector_store.delete_points([record.point_id])
            except Exception as cleanup_exc:
                logger.error(
                    "Failed to cleanup Qdrant point after DB failure for learned chat %s: %s",
                    session_id,
                    cleanup_exc,
                )
            raise

        return {
            "status": "success",
            "session_id": session_id,
            "message": "Chat resolved and learned.",
        }

    async def update(self, session_id: str, updates: dict) -> dict:
        learned = self.db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not learned:
            raise ValueError(f"Learned chat '{session_id}' not found.")
        if learned.IsActive is False:
            raise ValueError(f"Learned chat '{session_id}' is inactive. Restore it before updating.")

        original_reported = learned.IssueReported
        original_found = learned.IssueFound
        original_cause = learned.RootCause
        original_work = learned.WorkDone

        for field in ["issue_reported", "issue_found", "issue_cause", "work_done"]:
            if field in updates and updates[field] is not None:
                setattr(learned, field.replace("issue_cause", "RootCause").replace("issue_reported", "IssueReported").replace("issue_found", "IssueFound").replace("work_done", "WorkDone"), updates[field])

        record = self.consolidator.build_chat_record(
            session_id=session_id,
            issue_reported=learned.IssueReported,
            issue_found=learned.IssueFound,
            issue_cause=learned.RootCause,
            work_done=learned.WorkDone,
        )
        record.metadata["is_active"] = bool(learned.IsActive)

        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, record.page_content)
        try:
            self.vector_store.upsert_points([PointStruct(
                id=record.point_id,
                vector=vector,
                payload={"page_content": record.page_content, "metadata": record.metadata}
            )])
        except Exception as exc:
            self.db.rollback()
            raise VectorStoreError(f"Failed to upsert updated learned chat to Qdrant: {exc}") from exc

        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            try:
                old_record = self.consolidator.build_chat_record(
                    session_id=session_id,
                    issue_reported=original_reported,
                    issue_found=original_found,
                    issue_cause=original_cause,
                    work_done=original_work,
                )
                old_record.metadata["is_active"] = bool(learned.IsActive)
                old_vector = await asyncio.to_thread(self.embeddings.embed_query, old_record.page_content)
                self.vector_store.upsert_points([PointStruct(
                    id=old_record.point_id,
                    vector=old_vector,
                    payload={"page_content": old_record.page_content, "metadata": old_record.metadata}
                )])
            except Exception as cleanup_exc:
                logger.error(
                    "Failed to revert Qdrant point after DB failure for learned chat %s: %s",
                    session_id,
                    cleanup_exc,
                )
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

        try:
            self.vector_store.soft_delete_by_metadata("source_id", session_id)
        except Exception as exc:
            raise VectorStoreError(f"Failed to soft delete learned chat in Qdrant: {exc}") from exc

        learned.IsActive = False
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            try:
                self.vector_store.restore_by_metadata("source_id", session_id)
            except Exception as cleanup_exc:
                logger.error(
                    "Failed to restore Qdrant point after DB failure for learned chat %s: %s",
                    session_id,
                    cleanup_exc,
                )
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

        record = self.consolidator.build_chat_record(
            session_id=session_id,
            issue_reported=learned.IssueReported,
            issue_found=learned.IssueFound,
            issue_cause=learned.RootCause,
            work_done=learned.WorkDone,
        )
        record.metadata["is_active"] = True

        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, record.page_content)
        try:
            self.vector_store.upsert_points([PointStruct(
                id=record.point_id,
                vector=vector,
                payload={"page_content": record.page_content, "metadata": record.metadata}
            )])
            self.vector_store.restore_by_metadata("source_id", session_id)
        except Exception as exc:
            raise VectorStoreError(f"Failed to restore learned chat in Qdrant: {exc}") from exc

        learned.IsActive = True
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            try:
                self.vector_store.soft_delete_by_metadata("source_id", session_id)
            except Exception as cleanup_exc:
                logger.error(
                    "Failed to rollback Qdrant restore after DB failure for learned chat %s: %s",
                    session_id,
                    cleanup_exc,
                )
            raise

        return {"status": "success", "message": f"Learned chat {session_id} restored."}
