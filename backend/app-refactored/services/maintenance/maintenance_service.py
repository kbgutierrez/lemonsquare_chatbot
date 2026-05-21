"""
Maintenance service facade.
Provides clean interface for maintenance operations.
"""
from app.services.maintenance.consolidation_task import (
    consolidate_similar_tickets,
    LIVE_STATUS,
)


class MaintenanceService:
    """Facade for knowledge base maintenance operations."""

    @staticmethod
    def get_status() -> dict:
        return LIVE_STATUS.copy()

    @staticmethod
    async def run_consolidation(db, qdrant, embeddings) -> None:
        await consolidate_similar_tickets(db, qdrant, embeddings)
