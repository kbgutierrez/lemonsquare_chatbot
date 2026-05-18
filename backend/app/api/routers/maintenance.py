import logging
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_ingestion_service
from app.services.maintenance import LIVE_STATUS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/consolidate", summary="Clean up Qdrant by merging duplicate tickets")
async def trigger_knowledge_consolidation(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_chatbot_db),
    ingestion_service = Depends(get_ingestion_service)
):
    """
    Finds clusters of similar tickets, merges them via LLM into a Master Rule, 
    and deletes the redundant vectors to optimize the AI's memory.
    """
    def run_consolidation():
        import asyncio
        from app.services.maintenance import consolidate_similar_tickets
        asyncio.run(consolidate_similar_tickets(
            db, 
            ingestion_service.qdrant, 
            ingestion_service.embeddings
        ))

    background_tasks.add_task(run_consolidation)
    
    return {
        "status": "success",
        "message": "Knowledge consolidation started in the background."
    }

@router.get("/consolidate/status", summary="Get real-time consolidation progress")
def get_consolidation_status():
    """Returns the live, real-time status of the background deduplication job."""
    return LIVE_STATUS