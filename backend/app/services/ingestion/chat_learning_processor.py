"""
Chat learning processor.
Extracts knowledge from resolved chat sessions.
"""
import logging
from sqlalchemy.orm import Session
from qdrant_client.http.models import PointStruct
from app.models.chatbot import ChatMessage, ChatSession, LearnedChat
from app.core.exceptions import ValidationError
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

        learned.IssueReported = transcript[:500]
        learned.WorkDone = "Resolved via chat"
        learned.IsActive = True
        session.SessionStatus = "Resolved"
        self.db.commit()

        # Build and embed
        record = self.consolidator.build_chat_record(
            session_id=session_id,
            issue_reported=learned.IssueReported,
            issue_found=learned.IssueFound,
            issue_cause=learned.RootCause,
            work_done=learned.WorkDone,
        )

        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, record.page_content)
        self.vector_store.upsert_points([PointStruct(
            id=record.point_id,
            vector=vector,
            payload={"page_content": record.page_content, "metadata": record.metadata}
        )])

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

        for field in ["issue_reported", "issue_found", "issue_cause", "work_done"]:
            if field in updates and updates[field] is not None:
                setattr(learned, field.replace("issue_cause", "RootCause").replace("issue_reported", "IssueReported").replace("issue_found", "IssueFound").replace("work_done", "WorkDone"), updates[field])

        self.db.commit()

        # Re-embed
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
        self.vector_store.upsert_points([PointStruct(
            id=record.point_id,
            vector=vector,
            payload={"page_content": record.page_content, "metadata": record.metadata}
        )])

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
        self.db.commit()

        self.vector_store.soft_delete_by_metadata("source_id", session_id)

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
        self.db.commit()

        # Rebuild vector
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
        self.vector_store.upsert_points([PointStruct(
            id=record.point_id,
            vector=vector,
            payload={"page_content": record.page_content, "metadata": record.metadata}
        )])
        self.vector_store.restore_by_metadata("source_id", session_id)

        return {"status": "success", "message": f"Learned chat {session_id} restored."}
