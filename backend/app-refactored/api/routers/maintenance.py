"""
Maintenance router — REFACTORED.
Uses MaintenanceService facade for consolidation operations.
"""
import logging
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, get_ingestion_service
from app.core.database import SessionChatbot
from app.services.maintenance.maintenance_service import MaintenanceService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("/consolidate", summary="Clean up Qdrant by merging duplicate tickets")
async def trigger_knowledge_consolidation(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_chatbot_db),
    ingestion_service=Depends(get_ingestion_service),
):
    async def run_consolidation_task():
        db_background = SessionChatbot()
        try:
            await MaintenanceService.run_consolidation(
                db_background,
                ingestion_service.qdrant,
                ingestion_service.embeddings,
            )
        except Exception as e:
            logger.error("Background consolidation task failed: %s", e, exc_info=True)
        finally:
            db_background.close()

    background_tasks.add_task(run_consolidation_task)
    return {
        "status": "success",
        "message": "Knowledge consolidation started safely in the background.",
    }


@router.get("/consolidate/status", summary="Get real-time consolidation progress")
def get_consolidation_status():
    return MaintenanceService.get_status()
