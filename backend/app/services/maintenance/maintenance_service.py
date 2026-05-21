"""
Maintenance service facade.
Provides clean interface for maintenance operations.
"""
from app.services.maintenance.consolidation_task import LIVE_STATUS, run_safe_maintenance


class MaintenanceService:
    """Facade for knowledge base maintenance operations."""

    @staticmethod
    def get_status() -> dict:
        return LIVE_STATUS.copy()

    @staticmethod
    async def run_consolidation(db=None, qdrant=None, embeddings=None) -> None:
        await run_safe_maintenance()
