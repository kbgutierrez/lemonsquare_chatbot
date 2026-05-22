"""
Chat router — REFACTORED.
All business logic extracted to chat domain services.
Router is now pure HTTP: validates input, delegates, formats response.
"""
import asyncio
import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    get_chatbot_db,
    get_ingestion_service,
    get_orchestrator,
    require_admin_user,
)
from app.core.exceptions import AuthorizationError
from app.core.exceptions import AuthenticationError
from app.schemas.chat import (
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    ChatSessionMetaResponse,
    MessageRecord,
    ResolveChatResponse,
    ResolutionCheckResponse,
)
from app.schemas.tickets import (
    TicketDraftResponse,
    TicketEscalateResponse,
    TicketSubmitRequest,
)
from app.services.chat.escalation_service import EscalationService
from app.services.chat.message_service import MessageService
from app.services.chat.session_manager import SessionManager
from app.services.external.user_service import fetch_user_details
from app.core.rate_limit import limiter
from app.services.ingestion.ingestion_service import DocumentIngestionService
from app.services.rag.support_orchestrator import SupportOrchestrator
from app.services.resolution.conversation_resolver import ConversationResolutionService
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
async def handle_chat(
    request: Request,
    chat_request: ChatRequest,
    db: Session = Depends(get_chatbot_db),
    orchestrator: SupportOrchestrator = Depends(get_orchestrator),
) -> ChatResponse:
    try:
        user_data = await fetch_user_details(chat_request.user_token)
        user_id = int(user_data.get("id") or 1)
        user_name = (
            f"{user_data.get('firstname', 'Guest')} "
            f"{user_data.get('lastname', 'User')}"
        ).strip()

    except AuthenticationError:
        raise

    except Exception as exc:
        logger.error("Authentication failure: %s", exc)
        raise AuthenticationError("User authentication failed.") from exc

    session_mgr = SessionManager(db)
    msg_svc = MessageService(db)

    session_id = await asyncio.to_thread(session_mgr.get_or_create, chat_request.session_id, user_id)

    await asyncio.to_thread(
        msg_svc.save_user_message,
        session_id=session_id,
        content=chat_request.message,
    )

    history_text = await asyncio.to_thread(msg_svc.get_history_text, session_id)

    display_text, action, resolution_message, ticket_ids = await orchestrator.orchestrate(
        user_query=chat_request.message,
        chat_history=history_text,
        user_name=user_name,
        db=db,
    )

    # Persist only the human-visible assistant text
    msg_svc.save_ai_message(
        session_id=session_id,
        content=display_text,
    )

    # Map action to UI flags
    show_resolution_prompt = False
    allow_ticket_submission = False
    conversation_status = "active"
    resolution_action = "active"

    if str(action).lower() == "show_ticket":
        show_resolution_prompt = False
        allow_ticket_submission = True
        conversation_status = "need_ticket"
        resolution_action = "need_ticket"
    elif str(action).lower() == "show_resolve":
        show_resolution_prompt = True
        allow_ticket_submission = False
        conversation_status = "resolved_candidate"
        resolution_action = "resolved_chat"

    return ChatResponse(
        session_id=session_id,
        response=display_text,
        ticket_ids_used=ticket_ids,
        show_resolution_prompt=show_resolution_prompt,
        allow_ticket_submission=allow_ticket_submission,
        conversation_status=conversation_status,
        resolution_action=resolution_action,
        resolution_confidence=1.0,
        resolution_message=resolution_message,
    )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    user_token: str,
    db: Session = Depends(get_chatbot_db),
) -> ChatHistoryResponse:
    user_data = await fetch_user_details(user_token)
    user_id = user_data.get("id") or 1

    session_mgr = SessionManager(db)
    session_mgr.verify_ownership(session_id, user_id)

    msg_svc = MessageService(db)
    messages = msg_svc.get_all_messages(session_id)

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            MessageRecord(
                MessageID=msg.MessageID,
                SessionID=msg.SessionID,
                SenderRole=msg.SenderRole,
                MessageContent=msg.MessageContent,
                CreatedAt=(
                    msg.CreatedAt.isoformat()
                    if msg.CreatedAt
                    else ""
                ),
            )
            for msg in messages
        ],
    )


@router.get(
    "/user-sessions/{requester_id}",
    response_model=list[ChatSessionMetaResponse],
)
def get_user_chat_sessions(
    requester_id: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_chatbot_db),
):
    from app.repositories.chat_repository import ChatRepository

    current_user_id = str(current_user.get("id"))
    is_admin = str(current_user.get("role", "")).lower() in {"admin", "administrator"} or bool(current_user.get("is_admin"))
    if not is_admin and str(requester_id) != current_user_id:
        raise AuthorizationError("You can only view your own chat sessions.")

    sessions = ChatRepository(db).list_user_sessions(
        requester_id,
        limit,
    )

    return [
        {
            "session_id": sid,
            "status": status or "Active",
            "created_at": start_time,
            "message_count": msg_count,
            "user_id": str(req_id),
        }
        for sid, status, start_time, req_id, msg_count in sessions
    ]


@router.get(
    "/all-sessions",
    response_model=list[ChatSessionMetaResponse],
)
def get_all_chat_sessions(
    limit: int = 50,
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
):
    from app.repositories.chat_repository import ChatRepository

    sessions = ChatRepository(db).list_all_sessions(limit)

    return [
        {
            "session_id": sid,
            "status": status or "Active",
            "created_at": start_time,
            "message_count": msg_count,
            "user_id": str(req_id),
        }
        for sid, status, start_time, req_id, msg_count in sessions
    ]


@router.post(
    "/resolve/{session_id}",
    response_model=ResolveChatResponse,
)
async def mark_chat_resolved(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(
        get_ingestion_service
    ),
):
    return await ingestion_service.process_resolved_chat(
        session_id=session_id,
        db=db,
    )


@router.get(
    "/escalate/draft/{session_id}",
    response_model=TicketDraftResponse,
)
async def draft_escalation(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
):
    result = await EscalationService(db).draft_escalation(session_id)

    return TicketDraftResponse(**result)


@router.post(
    "/escalate/submit",
    response_model=TicketEscalateResponse,
)
async def submit_escalation(
    request: TicketSubmitRequest,
    db: Session = Depends(get_chatbot_db),
):
    result = await EscalationService(db).submit_escalation(
        request.model_dump()
    )

    return TicketEscalateResponse(**result)


@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
):
    SessionManager(db).archive(session_id)

    return {
        "status": "success",
        "message": f"Session {session_id} archived successfully.",
    }


@router.delete("/users/{requester_id}/sessions")
def clear_all_user_chats(
    requester_id: int,
    current_user: dict = Depends(require_admin_user),
    db: Session = Depends(get_chatbot_db),
):
    count = SessionManager(db).archive_all_for_user(requester_id)

    if count == 0:
        return {
            "status": "skipped",
            "message": "No active chats to clear.",
        }

    return {
        "status": "success",
        "message": f"Successfully cleared {count} chat sessions.",
    }



from app.services.resolution.conversation_resolver import ConversationResolutionService

from app.services.taxonomy.taxonomy_service import get_live_taxonomy

@router.get("/taxonomy")
async def get_taxonomy():
    """Returns the live taxonomy (departments and subcategories)."""
    import json
    data = await get_live_taxonomy()
    return json.loads(data)

@router.get("/{session_id}/check-resolution", response_model=ResolutionCheckResponse)
async def check_chat_resolution(
    session_id: str,
    db: Session = Depends(get_chatbot_db)
):
    """Analyzes the recent chat history to see if buttons should be shown."""
    msg_svc = MessageService(db)
    
    # 1. Grab the latest history
    history_text = await asyncio.to_thread(msg_svc.get_history_text, session_id)
    messages = msg_svc.get_all_messages(session_id)
    
    if not messages:
        return ResolutionCheckResponse(
            show_resolution_prompt=False,
            allow_ticket_submission=True,
            conversation_status="active",
            resolution_action="active",
            resolution_confidence=0.0,
        )

    # 2. Get the very last user message and AI response
    user_query = next((m.MessageContent for m in reversed(messages) if m.SenderRole == "user"), "")
    ai_response = next((m.MessageContent for m in reversed(messages) if m.SenderRole == "ai"), "")

    # 3. Run the LLM Analyzer
    resolver = ConversationResolutionService(db)
    resolution_data = await resolver.analyze_conversation(
        user_query=user_query,
        ai_response=ai_response,
        chat_history=history_text
    )

    return ResolutionCheckResponse(
        show_resolution_prompt=resolution_data.get("show_resolution_prompt", False),
        allow_ticket_submission=resolution_data.get("allow_ticket_submission", False),
        conversation_status=resolution_data.get("conversation_status", "active"),
        resolution_action=resolution_data.get("resolution_action", "active"),
        resolution_confidence=float(resolution_data.get("resolution_confidence", 0.0)),
        resolution_message=resolution_data.get("resolution_message")
    )