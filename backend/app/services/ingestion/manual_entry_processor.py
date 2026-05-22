"""
Manual knowledge entry processor.
Handles create, update, delete, restore for manual KB rules.
"""

import logging
import uuid

from sqlalchemy.orm import Session
from qdrant_client.http.models import PointStruct

from app.core.exceptions import VectorStoreError
from app.models.chatbot import ManualKnowledgeEntry
from app.services.consolidation.knowledge_consolidator import KnowledgeConsolidator

logger = logging.getLogger(__name__)


class ManualEntryProcessor:

    def __init__(
        self,
        db: Session,
        vector_store,
        embeddings,
    ):
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.consolidator = (
            KnowledgeConsolidator()
        )

    """
    ========================================
    CATEGORY RESOLUTION
    ========================================
    """

    def _resolve_category(
        self,
        category: str | None,
    ) -> str:

        """
        IMPORTANT:
        Empty string / None means:
        AUTO DETECT CATEGORY

        We MUST NOT force
        General_IT anymore.

        The frontend intentionally sends:
            category = ""

        to trigger AI categorization.
        """

        if category is None:
            return ""

        cleaned = (
            str(category)
            .strip()
        )

        return cleaned

    async def process(
        self,
        title: str,
        content: str,
        category: str | None,
    ) -> dict:

        resolved_category = (
            self._resolve_category(
                category
            )
        )

        entry_id = str(uuid.uuid4())

        entry = ManualKnowledgeEntry(
            EntryID=entry_id,
            Title=title,
            Content=content,
            Category=resolved_category,
            IsActive=True,
        )

        record = (
            self.consolidator
            .build_manual_record(
                entry_id=entry.EntryID,
                title=title,
                content=content,
                category=resolved_category,
            )
        )

        import asyncio

        vector = (
            await asyncio.to_thread(
                self.embeddings.embed_query,
                content,
            )
        )

        try:

            self.vector_store.upsert_points([
                PointStruct(
                    id=record.point_id,
                    vector=vector,
                    payload={
                        "page_content":
                            record.page_content,

                        "metadata":
                            record.metadata,
                    },
                )
            ])

        except Exception as exc:

            raise VectorStoreError(
                f"Failed to upsert manual entry to Qdrant: {exc}"
            ) from exc

        try:

            self.db.add(entry)

            self.db.commit()

            self.db.refresh(entry)

        except Exception:

            try:

                self.vector_store.delete_points([
                    record.point_id
                ])

            except Exception as cleanup_exc:

                logger.error(
                    (
                        "Failed to cleanup "
                        "Qdrant point after "
                        "DB failure for "
                        "manual entry %s: %s"
                    ),
                    entry_id,
                    cleanup_exc,
                )

            raise

        return {
            "entry_id":
                entry.EntryID,

            "title":
                entry.Title,

            "content":
                entry.Content,

            "category":
                entry.Category,

            "created_at":
                entry.CreatedAt,

            "updated_at":
                entry.UpdatedAt,

            "is_active":
                entry.IsActive,
        }

    async def update(
        self,
        entry_id: str,
        updates: dict,
    ) -> dict:

        entry = (
            self.db.query(
                ManualKnowledgeEntry
            )
            .filter(
                ManualKnowledgeEntry.EntryID
                == entry_id
            )
            .first()
        )

        if not entry:

            raise ValueError(
                f"Manual entry '{entry_id}' not found."
            )

        if entry.IsActive is False:

            raise ValueError(
                (
                    f"Manual entry "
                    f"'{entry_id}' is inactive. "
                    f"Restore it before updating."
                )
            )

        original_title = (
            entry.Title
        )

        original_content = (
            entry.Content
        )

        original_category = (
            entry.Category
        )

        if (
            "title" in updates
            and updates["title"]
        ):
            entry.Title = (
                updates["title"]
            )

        if (
            "content" in updates
            and updates["content"]
        ):
            entry.Content = (
                updates["content"]
            )

        """
        ========================================
        PRESERVE EMPTY CATEGORY
        ========================================
        """

        if "category" in updates:

            entry.Category = (
                self._resolve_category(
                    updates["category"]
                )
            )

        record = (
            self.consolidator
            .build_manual_record(
                entry_id=entry.EntryID,
                title=entry.Title,
                content=entry.Content,
                category=entry.Category,
            )
        )

        record.metadata[
            "is_active"
        ] = bool(entry.IsActive)

        import asyncio

        vector = (
            await asyncio.to_thread(
                self.embeddings.embed_query,
                entry.Content,
            )
        )

        try:

            self.vector_store.upsert_points([
                PointStruct(
                    id=record.point_id,
                    vector=vector,
                    payload={
                        "page_content":
                            record.page_content,

                        "metadata":
                            record.metadata,
                    },
                )
            ])

        except Exception as exc:

            self.db.rollback()

            raise VectorStoreError(
                (
                    "Failed to upsert "
                    "updated manual "
                    f"entry to Qdrant: {exc}"
                )
            ) from exc

        try:

            self.db.commit()

            self.db.refresh(entry)

        except Exception:

            logger.warning(
                (
                    "DB commit failed "
                    "after Qdrant update "
                    "for manual entry %s, "
                    "attempting rollback."
                ),
                entry_id,
            )

            self.db.rollback()

            try:

                old_record = (
                    self.consolidator
                    .build_manual_record(
                        entry_id=entry.EntryID,
                        title=original_title,
                        content=original_content,
                        category=original_category,
                    )
                )

                old_record.metadata[
                    "is_active"
                ] = bool(entry.IsActive)

                old_vector = (
                    await asyncio.to_thread(
                        self.embeddings.embed_query,
                        original_content,
                    )
                )

                self.vector_store.upsert_points([
                    PointStruct(
                        id=old_record.point_id,
                        vector=old_vector,
                        payload={
                            "page_content":
                                old_record.page_content,

                            "metadata":
                                old_record.metadata,
                        },
                    )
                ])

            except Exception as cleanup_exc:

                logger.error(
                    (
                        "Failed to revert "
                        "Qdrant point after "
                        "DB failure for "
                        "manual entry %s: %s"
                    ),
                    entry_id,
                    cleanup_exc,
                )

            raise

        return {
            "entry_id":
                entry.EntryID,

            "title":
                entry.Title,

            "content":
                entry.Content,

            "category":
                entry.Category,

            "updated_at":
                entry.UpdatedAt,
        }

    async def delete(
        self,
        entry_id: str,
    ) -> dict:

        entry = (
            self.db.query(
                ManualKnowledgeEntry
            )
            .filter(
                ManualKnowledgeEntry.EntryID
                == entry_id
            )
            .first()
        )

        if not entry:

            raise ValueError(
                f"Manual entry '{entry_id}' not found."
            )

        if entry.IsActive is False:

            return {
                "status":
                    "skipped",

                "message":
                    (
                        f"Manual entry "
                        f"{entry_id} "
                        "is already inactive."
                    ),
            }

        try:

            self.vector_store.soft_delete_by_metadata(
                "source_id",
                entry_id,
            )

        except Exception as exc:

            raise VectorStoreError(
                (
                    "Failed to soft delete "
                    f"manual entry in Qdrant: {exc}"
                )
            ) from exc

        entry.IsActive = False

        try:

            self.db.commit()

        except Exception:

            self.db.rollback()

            try:

                self.vector_store.restore_by_metadata(
                    "source_id",
                    entry_id,
                )

            except Exception as cleanup_exc:

                logger.error(
                    (
                        "Failed to restore "
                        "Qdrant point after "
                        "DB failure for "
                        "manual entry %s: %s"
                    ),
                    entry_id,
                    cleanup_exc,
                )

            raise

        return {
            "status":
                "success",

            "message":
                (
                    f"Manual entry "
                    f"{entry_id} "
                    "soft-deleted."
                ),
        }

    async def restore(
        self,
        entry_id: str,
    ) -> dict:

        entry = (
            self.db.query(
                ManualKnowledgeEntry
            )
            .filter(
                ManualKnowledgeEntry.EntryID
                == entry_id
            )
            .first()
        )

        if not entry:

            raise ValueError(
                f"Manual entry '{entry_id}' not found."
            )

        if entry.IsActive is True:

            return {
                "status":
                    "skipped",

                "message":
                    (
                        f"Manual entry "
                        f"{entry_id} "
                        "is already active."
                    ),
            }

        record = (
            self.consolidator
            .build_manual_record(
                entry_id=entry.EntryID,
                title=entry.Title,
                content=entry.Content,
                category=entry.Category,
            )
        )

        record.metadata[
            "is_active"
        ] = True

        import asyncio

        vector = (
            await asyncio.to_thread(
                self.embeddings.embed_query,
                entry.Content,
            )
        )

        try:

            self.vector_store.upsert_points([
                PointStruct(
                    id=record.point_id,
                    vector=vector,
                    payload={
                        "page_content":
                            record.page_content,

                        "metadata":
                            record.metadata,
                    },
                )
            ])

            self.vector_store.restore_by_metadata(
                "source_id",
                entry_id,
            )

        except Exception as exc:

            raise VectorStoreError(
                (
                    "Failed to restore "
                    f"manual entry in Qdrant: {exc}"
                )
            ) from exc

        entry.IsActive = True

        try:

            self.db.commit()

        except Exception:

            self.db.rollback()

            try:

                self.vector_store.soft_delete_by_metadata(
                    "source_id",
                    entry_id,
                )

            except Exception as cleanup_exc:

                logger.error(
                    (
                        "Failed to rollback "
                        "Qdrant restore after "
                        "DB failure for "
                        "manual entry %s: %s"
                    ),
                    entry_id,
                    cleanup_exc,
                )

            raise

        return {
            "status":
                "success",

            "message":
                (
                    f"Manual entry "
                    f"{entry_id} restored."
                ),
        }