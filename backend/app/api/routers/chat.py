import logging
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import (
    get_chatbot_db,
    get_ingestion_service,
    get_orchestrator,
)
from app.core.exceptions import AuthenticationError
from app.schemas.chat import (
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    ChatSessionMetaResponse,
    MessageRecord,
    ResolveChatResponse,
)
from app.schemas.tickets import (
    TicketDraftResponse,
    TicketEscalateResponse,
    TicketSubmitRequest,
)
from app.services import chat_service
from app.services.ingestion_service import DocumentIngestionService
from app.services.orchestrator import SupportOrchestrator
from app.services.user_service import fetch_user_details

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "",
    response_model=ChatResponse,
)
async def handle_chat(
    request: ChatRequest,
    db: Session = Depends(get_chatbot_db),
    orchestrator: SupportOrchestrator = Depends(get_orchestrator),
) -> ChatResponse:
    try:
        user_data = await fetch_user_details(
            request.user_token
        )

        user_id = int(
            user_data.get("id") or 1
        )

        user_name = (
            f"{user_data.get('firstname', 'Guest')} "
            f"{user_data.get('lastname', 'User')}"
        ).strip()

    except AuthenticationError:
        raise

    except Exception as exc:
        logger.error(
            "Authentication failure: %s",
            exc,
        )

        raise AuthenticationError(
            "User authentication failed."
        ) from exc

    session_id = chat_service.get_or_create_session(
        db,
        request.session_id,
        user_id,
    )

    chat_service.save_message(
        db,
        session_id,
        "user",
        request.message,
    )

    history_text = (
        chat_service.get_recent_history_text(
            db,
            session_id,
        )
    )

    ai_response, ticket_ids = (
        await orchestrator.orchestrate(
            user_query=request.message,
            chat_history=history_text,
            user_name=user_name,
            db=db,
        )
    )

    chat_service.save_message(
        db,
        session_id,
        "ai",
        ai_response,
    )

    return ChatResponse(
        session_id=session_id,
        response=ai_response,
        ticket_ids_used=ticket_ids,
    )


@router.get(
    "/history/{session_id}",
    response_model=ChatHistoryResponse,
)
async def get_chat_history(
    session_id: str,
    user_token: str,
    db: Session = Depends(get_chatbot_db),
) -> ChatHistoryResponse:
    user_data = await fetch_user_details(
        user_token
    )

    user_id = user_data.get("id") or 1

    chat_service.get_session_with_auth_check(
        db,
        session_id,
        user_id,
    )

    messages = chat_service.get_all_messages(
        db,
        session_id,
    )

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
    db: Session = Depends(get_chatbot_db),
):
    from app.models.chatbot import (
        ChatMessage,
        ChatSession,
    )

    sessions = (
        db.query(
            ChatSession.SessionID,
            ChatSession.SessionStatus,
            ChatSession.StartTime,
            ChatSession.RequesterUserID,
            func.count(ChatMessage.MessageID).label(
                "message_count"
            ),
        )
        .outerjoin(
            ChatMessage,
            ChatSession.SessionID
            == ChatMessage.SessionID,
        )
        .filter(
            ChatSession.RequesterUserID
            == requester_id
        )
        .filter(ChatSession.IsActive == True)
        .group_by(
            ChatSession.SessionID,
            ChatSession.SessionStatus,
            ChatSession.StartTime,
            ChatSession.RequesterUserID,
        )
        .order_by(ChatSession.StartTime.desc())
        .limit(limit)
        .all()
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
    db: Session = Depends(get_chatbot_db),
):
    from app.models.chatbot import (
        ChatMessage,
        ChatSession,
    )

    sessions = (
        db.query(
            ChatSession.SessionID,
            ChatSession.SessionStatus,
            ChatSession.StartTime,
            ChatSession.RequesterUserID,
            func.count(ChatMessage.MessageID).label(
                "message_count"
            ),
        )
        .outerjoin(
            ChatMessage,
            ChatSession.SessionID
            == ChatMessage.SessionID,
        )
        .group_by(
            ChatSession.SessionID,
            ChatSession.SessionStatus,
            ChatSession.StartTime,
            ChatSession.RequesterUserID,
        )
        .order_by(ChatSession.StartTime.desc())
        .limit(limit)
        .all()
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
        session_id,
        db,
    )


@router.get(
    "/escalate/draft/{session_id}",
    response_model=TicketDraftResponse,
)
async def draft_escalation(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(
        get_ingestion_service
    ),
):
    result = await chat_service.draft_ticket_escalation(
        session_id,
        db,
        ingestion_service,
    )

    return TicketDraftResponse(**result)


@router.post(
    "/escalate/submit",
    response_model=TicketEscalateResponse,
)
async def submit_escalation(
    request: TicketSubmitRequest,
    db: Session = Depends(get_chatbot_db),
):
    result = await chat_service.submit_ticket_escalation(
        request.model_dump(),
        db,
    )

    return TicketEscalateResponse(**result)


@router.delete(
    "/sessions/{session_id}",
)
def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
):
    chat_service.archive_session(
        db,
        session_id,
    )

    return {
        "status": "success",
        "message": (
            f"Session {session_id} "
            f"archived successfully."
        ),
    }


@router.delete(
    "/users/{requester_id}/sessions",
)
def clear_all_user_chats(
    requester_id: int,
    db: Session = Depends(get_chatbot_db),
):
    count = chat_service.archive_all_user_sessions(
        db,
        requester_id,
    )

    if count == 0:
        return {
            "status": "skipped",
            "message": "No active chats to clear.",
        }

    return {
        "status": "success",
        "message": (
            f"Successfully cleared "
            f"{count} chat sessions."
        ),
    }