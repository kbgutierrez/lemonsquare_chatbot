"""
Chat endpoints.

Route handlers here are intentionally thin — they:
  1. Validate input (Pydantic does this automatically).
  2. Call the user service to authenticate the token.
  3. Delegate all business logic to chat_service and the orchestrator.
  4. Return a typed response.

The original handle_chat was ~150 lines with inline DB operations,
error handling, and AI calls all tangled together. The handler here
is ~40 lines of pure orchestration.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_orchestrator
from app.core.exceptions import AuthenticationError
from app.schemas.chat import ChatHistoryResponse, ChatRequest, ChatResponse, MessageRecord
from app.services import chat_service
from app.services.orchestrator import SupportOrchestrator
from app.services.user_service import fetch_user_details
from app.api.deps import get_chatbot_db, get_orchestrator, get_ingestion_service
from app.services.ingestion_service import DocumentIngestionService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def handle_chat(
    request: ChatRequest,
    db: Session = Depends(get_chatbot_db),
    orchestrator: SupportOrchestrator = Depends(get_orchestrator),
) -> ChatResponse:
    """
    Process a user chat message and return an AI response.

    Flow:
      1. Authenticate the user token.
      2. Create or validate the chat session.
      3. Save the user's message.
      4. Build chat history string.
      5. Run the RAG orchestrator.
      6. Save the AI's response.
      7. Return structured response.
    """
    # 1. Authenticate.
    try:
        user_data = await fetch_user_details(request.user_token)
        user_id = user_data.get("id") or 1
        user_name = (
            f"{user_data.get('firstname', 'Guest')} {user_data.get('lastname', 'User')}"
        ).strip()
    except AuthenticationError:
        raise
    except Exception as exc:
        # Unexpected auth failures fall back gracefully with a warning.
        logger.warning("Auth service error; using guest fallback: %s", exc)
        user_id = 1
        user_name = "Guest User"

    logger.info("Chat request from user_id=%d | session=%s", user_id, request.session_id)

    # 2. Session management.
    session_id = chat_service.get_or_create_session(db, request.session_id, user_id)

    # 3. Save user message.
    chat_service.save_message(db, session_id, "user", request.message)

    # 4. Build history for the AI prompt.
    history_text = chat_service.get_recent_history_text(db, session_id)

    # 5. AI pipeline.
    ai_response, ticket_ids = await orchestrator.orchestrate(
        user_query=request.message,
        chat_history=history_text,
        user_name=user_name,
        db=db,
    )
    logger.info("AI response generated for session=%s", session_id)

    # 6. Save AI response.
    chat_service.save_message(db, session_id, "ai", ai_response)

    return ChatResponse(
        session_id=session_id,
        response=ai_response,
        ticket_ids_used=ticket_ids,
    )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    user_token: str,
    db: Session = Depends(get_chatbot_db),
) -> ChatHistoryResponse:
    """
    Retrieve the full message history for a session.

    Verifies the requesting user owns the session before returning messages.
    """
    user_data = await fetch_user_details(user_token)
    user_id = user_data.get("id") or 1

    # Raises NotFoundError or AuthorizationError (handled globally).
    chat_service.get_session_with_auth_check(db, session_id, user_id)

    messages = chat_service.get_all_messages(db, session_id)

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            MessageRecord(
                MessageID=msg.MessageID,
                SessionID=msg.SessionID,
                SenderRole=msg.SenderRole,
                MessageContent=msg.MessageContent,
                CreatedAt=msg.CreatedAt.isoformat() if msg.CreatedAt else "",
            )
            for msg in messages
        ],
    )




@router.post("/resolve/{session_id}", tags=["Chat"])
async def mark_chat_resolved(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service),
):
    """
    Triggered when a user clicks 'Mark as Resolved' in the UI. 
    Reads the chat history, summarizes the fix, and adds it to Qdrant.
    """
    
    result = await ingestion_service.process_resolved_chat(session_id, db)
    return result