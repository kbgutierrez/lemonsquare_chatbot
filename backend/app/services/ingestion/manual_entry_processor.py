"""
Manual knowledge entry processor.
Handles create, update, delete, restore for manual KB rules.
"""
import logging
from sqlalchemy.orm import Session
from qdrant_client.http.models import PointStruct
from app.models.chatbot import ManualKnowledgeEntry
from app.repositories.document_repository import DocumentRepository
from app.services.consolidation.knowledge_consolidator import KnowledgeConsolidator

logger = logging.getLogger(__name__)


class ManualEntryProcessor:
    def __init__(self, db: Session, vector_store, embeddings):
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.consolidator = KnowledgeConsolidator()

    async def process(self, title: str, content: str, category: str | None) -> dict:
        resolved_category = category or "General_IT"
        entry = ManualKnowledgeEntry(
            Title=title,
            Content=content,
            Category=resolved_category,
            IsActive=True,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)

        # Build and embed
        record = self.consolidator.build_manual_record(
            entry_id=entry.EntryID,
            title=title,
            content=content,
            category=resolved_category,
        )
        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, content)
        self.vector_store.upsert_points([PointStruct(
            id=record.point_id,
            vector=vector,
            payload={"page_content": record.page_content, "metadata": record.metadata}
        )])

        return {
            "entry_id": entry.EntryID,
            "title": entry.Title,
            "content": entry.Content,
            "category": entry.Category,
            "created_at": entry.CreatedAt,
            "updated_at": entry.UpdatedAt,
            "is_active": entry.IsActive,
        }

    async def update(self, entry_id: str, updates: dict) -> dict:
        entry = self.db.query(ManualKnowledgeEntry).filter(
            ManualKnowledgeEntry.EntryID == entry_id
        ).first()
        if not entry:
            raise ValueError(f"Manual entry '{entry_id}' not found.")
        if entry.IsActive is False:
            raise ValueError(f"Manual entry '{entry_id}' is inactive. Restore it before updating.")

        if "title" in updates and updates["title"]:
            entry.Title = updates["title"]
        if "content" in updates and updates["content"]:
            entry.Content = updates["content"]
        if "category" in updates and updates["category"]:
            entry.Category = updates["category"]

        self.db.commit()
        self.db.refresh(entry)

        # Re-embed
        record = self.consolidator.build_manual_record(
            entry_id=entry.EntryID,
            title=entry.Title,
            content=entry.Content,
            category=entry.Category,
        )
        record.metadata["is_active"] = bool(entry.IsActive)
        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, entry.Content)
        self.vector_store.upsert_points([PointStruct(
            id=record.point_id,
            vector=vector,
            payload={"page_content": record.page_content, "metadata": record.metadata}
        )])

        return {
            "entry_id": entry.EntryID,
            "title": entry.Title,
            "content": entry.Content,
            "category": entry.Category,
            "updated_at": entry.UpdatedAt,
        }

    async def delete(self, entry_id: str) -> dict:
        entry = self.db.query(ManualKnowledgeEntry).filter(
            ManualKnowledgeEntry.EntryID == entry_id
        ).first()
        if not entry:
            raise ValueError(f"Manual entry '{entry_id}' not found.")
        if entry.IsActive is False:
            return {"status": "skipped", "message": f"Manual entry {entry_id} is already inactive."}

        entry.IsActive = False
        self.db.commit()

        self.vector_store.soft_delete_by_metadata("source_id", entry_id)

        return {"status": "success", "message": f"Manual entry {entry_id} soft-deleted."}

    async def restore(self, entry_id: str) -> dict:
        entry = self.db.query(ManualKnowledgeEntry).filter(
            ManualKnowledgeEntry.EntryID == entry_id
        ).first()
        if not entry:
            raise ValueError(f"Manual entry '{entry_id}' not found.")
        if entry.IsActive is True:
            return {"status": "skipped", "message": f"Manual entry {entry_id} is already active."}

        entry.IsActive = True
        self.db.commit()

        # Rebuild vector
        record = self.consolidator.build_manual_record(
            entry_id=entry.EntryID,
            title=entry.Title,
            content=entry.Content,
            category=entry.Category,
        )
        record.metadata["is_active"] = True
        import asyncio
        vector = await asyncio.to_thread(self.embeddings.embed_query, entry.Content)
        self.vector_store.upsert_points([PointStruct(
            id=record.point_id,
            vector=vector,
            payload={"page_content": record.page_content, "metadata": record.metadata}
        )])
        self.vector_store.restore_by_metadata("source_id", entry_id)

        return {"status": "success", "message": f"Manual entry {entry_id} restored."}
