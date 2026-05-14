from fastapi import APIRouter, Depends, Query, HTTPException
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from app.api.deps import get_ingestion_service, get_chatbot_db
from app.schemas.self_knowledge import AIKnowledgeItem, LearnedChatUpdateRequest
from sqlalchemy.orm import Session


router = APIRouter(prefix="/self_knowledge", tags=["AI Knowledge"])



@router.put("/chats/{session_id}", summary="Admin override: Correct AI chat summary")
async def edit_learned_chat(
    session_id: str,
    request: LearnedChatUpdateRequest,
    db: Session = Depends(get_chatbot_db),
    ingestion_service = Depends(get_ingestion_service)
):
    """If the AI hallucinated the summary, an Admin can fix it here and re-embed it."""
    try:
        # exclude_unset=True ensures we only update fields the user actually sent
        result = await ingestion_service.update_learned_chat(session_id, request.model_dump(exclude_unset=True), db)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.delete("/chats/{session_id}", summary="Force AI to unlearn a chat")
async def remove_learned_chat(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service = Depends(get_ingestion_service)
):
    """Deletes the extracted chat from SQL and scrubs its vectors from Qdrant."""
    result = await ingestion_service.delete_learned_chat(session_id, db)
    return result