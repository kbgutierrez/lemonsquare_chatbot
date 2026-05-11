import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from pydantic import (
    BaseModel,
    Field,
)

from app.api.deps import (
    get_chatbot_db,
)

from app.core.models import (
    ChatSession,
    ChatMessage,
)

from app.services.langchain_agent import (
    orchestrator,
)

router = APIRouter()


class ChatRequest(BaseModel):

    session_id: str | None = None

    message: str


class ChatResponse(BaseModel):

    session_id: str

    response: str

    ticket_ids_used: list[int] = Field(
        default_factory=list
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
)
def handle_chat(
    request: ChatRequest,
    db: Session = Depends(
        get_chatbot_db
    ),
):

    # CREATE SESSION
    if (
        not request.session_id
        or request.session_id.lower()
        == "null"
        or request.session_id == ""
    ):

        session_id = str(
            uuid.uuid4()
        )

        db.add(
            ChatSession(
                SessionID=session_id,
                RequesterUserID=1,
            )
        )

        db.commit()

    else:

        session_id = (
            request.session_id
        )

        existing_session = (
            db.query(
                ChatSession
            )
            .filter(
                ChatSession.SessionID
                == session_id
            )
            .first()
        )

        if not existing_session:

            raise HTTPException(
                status_code=404,
                detail="Chat session not found in database.",
            )

    # SAVE USER MESSAGE
    db.add(
        ChatMessage(
            SessionID=session_id,
            SenderRole="user",
            MessageContent=request.message,
        )
    )

    db.commit()

    # GET HISTORY
    history = (
        db.query(
            ChatMessage
        )
        .filter(
            ChatMessage.SessionID
            == session_id
        )
        .order_by(
            ChatMessage.CreatedAt.desc()
        )
        .limit(6)
        .all()
    )

    history.reverse()

    history_text = "\n".join([
        f"{msg.SenderRole}: {msg.MessageContent}"
        for msg in history[:-1]
    ])

    # AI
    try:

        ai_response, ticket_ids = (
            orchestrator.orchestrate(
                user_query=request.message,
                chat_history=history_text,
                db=db,
            )
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"AI Error: {str(e)}",
        )

    # SAVE AI MESSAGE
    db.add(
        ChatMessage(
            SessionID=session_id,
            SenderRole="ai",
            MessageContent=ai_response,
        )
    )

    db.commit()

    return ChatResponse(
        session_id=session_id,
        response=ai_response,
        ticket_ids_used=ticket_ids,
    )


# =========================================
# GET CHAT HISTORY
# =========================================

@router.get(
    "/chat/history/{session_id}"
)
def get_chat_history(
    session_id: str,
    db: Session = Depends(
        get_chatbot_db
    ),
):

    session = (
        db.query(
            ChatSession
        )
        .filter(
            ChatSession.SessionID
            == session_id
        )
        .first()
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Chat session not found.",
        )

    messages = (
        db.query(
            ChatMessage
        )
        .filter(
            ChatMessage.SessionID
            == session_id
        )
        .order_by(
            ChatMessage.CreatedAt.asc()
        )
        .all()
    )

    return {
        "session_id":
            session_id,

        "messages": [
            {
                "MessageID":
                    msg.MessageID,

                "SessionID":
                    msg.SessionID,

                "SenderRole":
                    msg.SenderRole,

                "MessageContent":
                    msg.MessageContent,

                "CreatedAt":
                    msg.CreatedAt,
            }
            for msg in messages
        ],
    }