<<<<<<< HEAD
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
from app.schemas.chat import ChatHistoryResponse, ChatRequest, ChatResponse, MessageRecord, ChatSessionMetaResponse
from app.services import chat_service
from app.services.orchestrator import SupportOrchestrator
from app.services.user_service import fetch_user_details
from app.api.deps import get_chatbot_db, get_orchestrator, get_ingestion_service
from app.services.ingestion_service import DocumentIngestionService
from app.schemas.chat import ChatHistoryResponse, ChatRequest, ChatResponse, MessageRecord, ChatSessionMetaResponse, ResolveChatResponse
from app.schemas.tickets import TicketEscalateRequest, TicketEscalateResponse
=======
import logging
from datetime import datetime
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1

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
<<<<<<< HEAD
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
=======
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1
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

<<<<<<< HEAD
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
=======
    session_id = chat_service.get_or_create_session(
        db,
        request.session_id,
        user_id,
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1
    )

<<<<<<< HEAD
    # 6. Save AI response.
    chat_service.save_message(db, session_id, "ai", ai_response)
=======
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
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1

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
<<<<<<< HEAD
    """
    Retrieve the full message history for a session.

    Verifies the requesting user owns the session before returning messages.
    """
    user_data = await fetch_user_details(user_token)
    user_id = user_data.get("id") or 1

    # Raises NotFoundError or AuthorizationError (handled globally).
    chat_service.get_session_with_auth_check(db, session_id, user_id)
=======
    user_data = await fetch_user_details(
        user_token
    )

    user_id = user_data.get("id") or 1

    chat_service.get_session_with_auth_check(
        db,
        session_id,
        user_id,
    )
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1

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


from datetime import datetime

@router.get(
    "/user-sessions/{requester_id}",
    response_model=list[ChatSessionMetaResponse],
)
def get_user_chat_sessions(
    requester_id: str,
    limit: int = 20,
    db: Session = Depends(get_chatbot_db),
):
<<<<<<< HEAD
    from app.models.chatbot import ChatSession
    
    # We can use order_by again because StartTime exists!
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.RequesterUserID == requester_id)
        .filter(ChatSession.IsActive == True) # <-- ADD THIS LINE
=======
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
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1
        .order_by(ChatSession.StartTime.desc())
        .limit(limit)
        .all()
    )
<<<<<<< HEAD
    
    result = []
    for s in sessions:
        result.append({
            "session_id": s.SessionID,
            "status": s.SessionStatus or "Active", # Using your real database column!
            "created_at": s.StartTime,             # Using your real database column!
            "message_count": len(s.messages) if s.messages else 0 
        })
        
    return result
=======

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

>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1

@router.get(
    "/all-sessions",
    response_model=list[ChatSessionMetaResponse],
)
def get_all_chat_sessions(
    limit: int = 50,
    db: Session = Depends(get_chatbot_db),
):
<<<<<<< HEAD
    """Admin-only endpoint to review all employee chats using ONLY available columns."""
    from app.models.chatbot import ChatSession
    
    # Change the basic .all() query to include the filter:
    sessions = (
        db.query(ChatSession)
        .all()
    )
    
    result = []
    for s in sessions:
        session_date = None
        if s.messages:
            sorted_messages = sorted(s.messages, key=lambda m: m.CreatedAt)
            session_date = sorted_messages[0].CreatedAt
            
        result.append({
            "session_id": s.SessionID,
            "user_id": str(s.RequesterUserID), # Convert BigInt to string for safety
            "status": "Archived",
            "created_at": session_date,
            "message_count": len(s.messages) if s.messages else 0 
        })
        
    result.sort(key=lambda x: x["created_at"] if x["created_at"] else datetime.min, reverse=True)
    return result[:limit]

=======
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
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1


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
<<<<<<< HEAD
    """
    Frontend triggers this when an employee clicks 'Mark as Resolved'.
    The AI will extract the problem/solution as strict JSON and add it to its brain.
    """
    result = await ingestion_service.process_resolved_chat(session_id, db)
    return result



from app.schemas.tickets import TicketDraftResponse, TicketSubmitRequest, TicketEscalateResponse

@router.get("/escalate/draft/{session_id}", response_model=TicketDraftResponse, summary="Draft ticket summary for frontend review")
async def draft_escalation(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
    ingestion_service: DocumentIngestionService = Depends(get_ingestion_service) # <-- NEW
):
    try:
        # Pass the ingestion_service into the chat service
        result = await chat_service.draft_ticket_escalation(session_id, db, ingestion_service) 
        return TicketDraftResponse(**result)
    except Exception as exc:
        logger.error(f"Failed to draft ticket: {exc}")
        return TicketDraftResponse(status="error", summary="", description=str(exc))
=======
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
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1

    return TicketDraftResponse(**result)


@router.post(
    "/escalate/submit",
    response_model=TicketEscalateResponse,
)
async def submit_escalation(
    request: TicketSubmitRequest,
    db: Session = Depends(get_chatbot_db),
):
<<<<<<< HEAD
    try:
        result = await chat_service.submit_ticket_escalation(request.model_dump(), db)
        return TicketEscalateResponse(**result)
    except Exception as exc:
        logger.error(f"Failed to submit ticket: {exc}")
        return TicketEscalateResponse(status="error", message=str(exc))
    
=======
    result = await chat_service.submit_ticket_escalation(
        request.model_dump(),
        db,
    )

    return TicketEscalateResponse(**result)

>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1

@router.delete(
    "/sessions/{session_id}",
)
def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_chatbot_db),
):
<<<<<<< HEAD
    """
    Soft-deletes a chat session so it disappears from user histories and admin views.
    """
    chat_service.archive_session(db, session_id)
    return {"status": "success", "message": f"Session {session_id} archived successfully."}
=======
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
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1


@router.delete(
    "/users/{requester_id}/sessions",
)
def clear_all_user_chats(
    requester_id: int,
    db: Session = Depends(get_chatbot_db),
):
<<<<<<< HEAD
    """
    Instantly soft-deletes every active chat session belonging to this user.
    """
    count = chat_service.archive_all_user_sessions(db, requester_id)
    
    if count == 0:
        return {"status": "skipped", "message": "No active chats to clear."}
        
    return {"status": "success", "message": f"Successfully cleared {count} chat sessions."}
=======
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
>>>>>>> c8bc4acd8d637b942594f0beb8d8dec3c07381e1
