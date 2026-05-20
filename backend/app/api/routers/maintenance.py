import logging
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_ingestion_service
from app.services.maintenance import LIVE_STATUS
from app.core.database import SessionChatbot

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/consolidate", summary="Clean up Qdrant by merging duplicate tickets")
async def trigger_knowledge_consolidation(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_chatbot_db), # Kept for explicit auth/dependency matching
    ingestion_service = Depends(get_ingestion_service)
):
    """
    Finds clusters of similar tickets, merges them via LLM into a Master Rule, 
    and deletes the redundant vectors to optimize the AI's memory.
    """
    
    async def run_consolidation_task():
        # Spin up an independent database session for the background thread
        # to prevent DetachedInstanceError when the main request loop closes.
        db_background = SessionChatbot()
        try:
            from app.services.maintenance import consolidate_similar_tickets
            await consolidate_similar_tickets(
                db_background, 
                ingestion_service.qdrant, 
                ingestion_service.embeddings
            )
        except Exception as e:
            logger.error(f"Background consolidation task failed: {e}", exc_info=True)
        finally:
            db_background.close()

    background_tasks.add_task(run_consolidation_task)
    
    return {
        "status": "success",
        "message": "Knowledge consolidation started safely in the background."
    }

@router.get("/consolidate/status", summary="Get real-time consolidation progress")
def get_consolidation_status():
    """Returns the live, real-time status of the background deduplication job."""
    return LIVE_STATUS