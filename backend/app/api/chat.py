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

    try:

        # ================================
        # CREATE / REUSE SESSION
        # ================================

        session_id = (
            request.session_id
        )

        if (
            not session_id
            or session_id == ""
            or str(session_id).lower()
            == "null"
        ):

            session_id = str(
                uuid.uuid4()
            )

            new_session = ChatSession(
                SessionID=session_id,
                RequesterUserID=1,
            )

            db.add(
                new_session
            )

            db.commit()

            print(
                f"✅ Created session: {session_id}"
            )

        # ================================
        # SAVE USER MESSAGE
        # ================================

        user_message = ChatMessage(
            SessionID=session_id,
            SenderRole="user",
            MessageContent=request.message,
        )

        db.add(
            user_message
        )

        db.commit()

        # ================================
        # GET HISTORY
        # ================================

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

        # ================================
        # AI RESPONSE
        # ================================

        ai_response, ticket_ids = (
            orchestrator.orchestrate(
                user_query=request.message,
                chat_history=history_text,
                db=db,
            )
        )

        # ================================
        # SAVE AI MESSAGE
        # ================================

        ai_message = ChatMessage(
            SessionID=session_id,
            SenderRole="ai",
            MessageContent=ai_response,
        )

        db.add(
            ai_message
        )

        db.commit()

        return ChatResponse(
            session_id=session_id,
            response=ai_response,
            ticket_ids_used=ticket_ids,
        )

    except Exception as e:

        print(
            f"❌ CHAT ERROR: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
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

    try:

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

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )