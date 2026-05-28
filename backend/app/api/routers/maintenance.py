"""
Maintenance router — REFACTORED.
Uses MaintenanceService facade for consolidation operations.
"""
import logging
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, get_ingestion_service, require_admin_user
from app.core.database import SessionChatbot
from app.services.maintenance.maintenance_service import MaintenanceService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


from pydantic import BaseModel
from fastapi import HTTPException
from app.services.retrieval.vector_store import get_shared_vector_store
from app.repositories.document_repository import DocumentRepository

class WipeConfirmationRequest(BaseModel):
    confirm_wipe: str

@router.delete("/wipe-all", summary="Factory Reset AI Knowledge (Preserves Tickets)")
async def factory_reset_ai_knowledge(
    payload: WipeConfirmationRequest,
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
    vector_store = Depends(get_shared_vector_store)
):
    """
    Physically destroys all internally managed knowledge (Docs, Manual Rules, Learned Chats) 
    from both SQL and Qdrant. Preserves Helpdesk tickets.
    """
    # 1. Safety Guard
    if payload.confirm_wipe != "I_UNDERSTAND_THIS_IS_IRREVERSIBLE":
        raise HTTPException(
            status_code=400, 
            detail="Invalid confirmation string. Please confirm you understand this is irreversible."
        )

    repo = DocumentRepository(db)

    try:
        # 2. SQL Truncation (Documents, Manual Rules, Learned Chats)
        repo.truncate_owned_knowledge()
        logger.warning(f"CRITICAL: Admin {current_user.get('id')} triggered factory reset of SQL knowledge.")

        # 3. Filtered Vector Wipe
        vector_store.wipe_all_except_tickets()
        logger.warning("CRITICAL: Qdrant collection wiped (excluding tickets).")

        return {
            "status": "success",
            "message": "Factory reset complete. Uploaded Documents, Manual Rules, and AI Chats were destroyed. Helpdesk tickets are preserved."
        }

    except Exception as e:
        logger.error(f"Factory Reset failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Factory Reset encountered a critical error.")


@router.post("/consolidate", summary="Run safe knowledge-base maintenance")
async def trigger_knowledge_consolidation(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
    ingestion_service=Depends(get_ingestion_service),
):
    async def run_consolidation_task():
        db_background = SessionChatbot()
        try:
            await MaintenanceService.run_consolidation(db_background)
        except Exception as e:
            logger.error("Background consolidation task failed: %s", e, exc_info=True)
        finally:
            db_background.close()

    background_tasks.add_task(run_consolidation_task)
    return {
        "status": "success",
        "message": "Safe maintenance started in the background.",
    }


@router.get("/consolidate/status", summary="Get real-time consolidation progress")
def get_consolidation_status():
    return MaintenanceService.get_status()
