"""
AI Self-Knowledge management router.
Admin operations for correcting AI-learned knowledge.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, get_ingestion_service
from app.schemas.self_knowledge import LearnedChatUpdateRequest

router = APIRouter(prefix="/self_knowledge", tags=["AI Knowledge"])


@router.put("/chats/{session_id}", summary="Admin override: Correct AI chat summary")
async def edit_learned_chat(
    session_id: str,
    request: LearnedChatUpdateRequest,
    db: Session = Depends(get_chatbot_db),
    ingestion_service=Depends(get_ingestion_service),
):
    try:
        result = await ingestion_service.update_learned_chat(
            session_id, request.model_dump(exclude_unset=True), db
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.delete("/chats/{session_id}", summary="Force AI to unlearn a chat")
async def remove_learned_chat(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service=Depends(get_ingestion_service),
):
    result = await ingestion_service.delete_learned_chat(session_id, db)
    return result


@router.post("/chats/{session_id}/restore", summary="Restore a deleted AI chat summary")
async def restore_learned_chat(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service=Depends(get_ingestion_service),
):
    try:
        result = await ingestion_service.restore_learned_chat(session_id, db)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
