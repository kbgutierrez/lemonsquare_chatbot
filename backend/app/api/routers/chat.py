"""
Chat endpoints.

Route handlers here are intentionally thin — they:
  1. Validate input (Pydantic does this automatically).
  2. Call the user service to authenticate the token.
  3. Delegate all business logic to chat_service and the orchestrator.
  4. Return a typed response.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_chatbot_db, get_orchestrator
from app.core.exceptions import AuthenticationError
from app.schemas.chat import ChatHistoryResponse, ChatRequest, ChatResponse, MessageRecord, ChatSessionMetaResponse
from app.services import chat_service
from app.services.orchestrator import SupportOrchestrator
from app.services.user_service import fetch_user_details
from app.api.deps import get_ingestion_service
from app.services.ingestion_service import DocumentIngestionService
from app.schemas.chat import ResolveChatResponse
from app.schemas.tickets import TicketDraftResponse, TicketSubmitRequest, TicketEscalateResponse
from datetime import datetime

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
    """
    try:
        logger.debug("Authenticating token: %s", request.user_token[:10] + "...")
        user_data = await fetch_user_details(request.user_token)
        logger.debug("Auth returned user_data: %s", user_data)
        user_id = int(user_data.get("id") or 1)
        user_name = (
            f"{user_data.get('firstname', 'Guest')} {user_data.get('lastname', 'User')}"
        ).strip()
        logger.info("Auth successful: user_id=%d, user_name=%s", user_id, user_name)
    except AuthenticationError as exc:
        logger.error("Authentication failed: %s", exc)
        raise
    except Exception as exc:
        logger.error("Auth service error; rejecting request: %s", exc)
        raise AuthenticationError("User authentication failed.") from exc

    logger.info("Chat request from user_id=%d | session=%s", user_id, request.session_id)

    session_id = chat_service.get_or_create_session(db, request.session_id, user_id)
    chat_service.save_message(db, session_id, "user", request.message)

    history_text = chat_service.get_recent_history_text(db, session_id)

    ai_response, ticket_ids = await orchestrator.orchestrate(
        user_query=request.message,
        chat_history=history_text,
        user_name=user_name,
        db=db,
    )
    logger.info("AI response generated for session=%s", session_id)

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
    """
    user_data = await fetch_user_details(user_token)
    user_id = user_data.get("id") or 1

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


@router.get(
    "/user-sessions/{requester_id}", 
    response_model=list[ChatSessionMetaResponse], 
    summary="Get all chat sessions for a specific user"
)
def get_user_chat_sessions(
    requester_id: str,
    limit: int = 20,
    db: Session = Depends(get_chatbot_db)
):
    from app.models.chatbot import ChatSession, ChatMessage
    
    # Use aggregation to avoid N+1 queries when fetching message lengths
    sessions = (
        db.query(
            ChatSession.SessionID,
            ChatSession.SessionStatus,
            ChatSession.StartTime,
            ChatSession.RequesterUserID,
            func.count(ChatMessage.MessageID).label("message_count")
        )
        .outerjoin(ChatMessage, ChatSession.SessionID == ChatMessage.SessionID)
        .filter(ChatSession.RequesterUserID == requester_id)
        .filter(ChatSession.IsActive == True)
        .group_by(
            ChatSession.SessionID,
            ChatSession.SessionStatus,
            ChatSession.StartTime,
            ChatSession.RequesterUserID
        )
        .order_by(ChatSession.StartTime.desc())
        .limit(limit)
        .all()
    )
    
    result = []
    for sid, status, start_time, req_id, msg_count in sessions:
        result.append({
            "session_id": sid,
            "status": status or "Active",
            "created_at": start_time,
            "message_count": msg_count,
            "user_id": str(req_id)
        })
        
    return result

@router.get(
    "/all-sessions", 
    response_model=list[ChatSessionMetaResponse], 
    summary="Admin Audit: List all chats"
)
def get_all_chat_sessions(
    limit: int = 50,
    db: Session = Depends(get_chatbot_db)
):
    """Admin-only endpoint to review all employee chats natively bypassing N+1 execution."""
    from app.models.chatbot import ChatSession, ChatMessage
    
    # Fully offload limiting and aggregation to the SQL engine
    sessions = (
        db.query(
            ChatSession.SessionID,
            ChatSession.StartTime,
            ChatSession.RequesterUserID,
            func.count(ChatMessage.MessageID).label("message_count")
        )
        .outerjoin(ChatMessage, ChatSession.SessionID == ChatMessage.SessionID)
        .group_by(
            ChatSession.SessionID,
            ChatSession.StartTime,
            ChatSession.RequesterUserID
        )
        .order_by(ChatSession.StartTime.desc())
        .limit(limit)
        .all()
    )
    
    result = []
    for sid, start_time, req_id, msg_count in sessions:
        result.append({
            "session_id": sid,
            "user_id": str(req_id),
            "status": "Archived",
            "created_at": start_time,
            "message_count": msg_count 
        })
        
    return result


@router.post(
    "/resolve/{session_id}", 
    response_model=ResolveChatResponse, 
    summary="Mark chat as resolved and extract KB data"
)
async def mark_chat_resolved(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service)
):
    result = await ingestion_service.process_resolved_chat(session_id, db)
    return result


@router.get("/escalate/draft/{session_id}", response_model=TicketDraftResponse, summary="Draft ticket summary for frontend review")
async def draft_escalation(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service)
):
    try:
        result = await chat_service.draft_ticket_escalation(session_id, db, ingestion_service) 
        return TicketDraftResponse(**result)
    except Exception as exc:
        logger.error(f"Failed to draft ticket: {exc}")
        return TicketDraftResponse(status="error", summary="", description=str(exc))

@router.post("/escalate/submit", response_model=TicketEscalateResponse, summary="Submit the reviewed ticket to live agents")
async def submit_escalation(
    request: TicketSubmitRequest,
    db: Session = Depends(get_chatbot_db),
):
    try:
        result = await chat_service.submit_ticket_escalation(request.model_dump(), db)
        return TicketEscalateResponse(**result)
    except Exception as exc:
        logger.error(f"Failed to submit ticket: {exc}")
        return TicketEscalateResponse(status="error", message=str(exc))


@router.delete("/sessions/{session_id}", summary="Archive a chat session")
def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_chatbot_db)
):
    chat_service.archive_session(db, session_id)
    return {"status": "success", "message": f"Session {session_id} archived successfully."}


@router.delete("/users/{requester_id}/sessions", summary="Archive all chats for a specific user")
def clear_all_user_chats(
    requester_id: int,
    db: Session = Depends(get_chatbot_db)
):
    count = chat_service.archive_all_user_sessions(db, requester_id)
    if count == 0:
        return {"status": "skipped", "message": "No active chats to clear."}
        
    return {"status": "success", "message": f"Successfully cleared {count} chat sessions."}