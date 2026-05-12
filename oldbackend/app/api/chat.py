import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import (
    BaseModel,
    Field,
)

from sqlalchemy.orm import Session

from app.api.deps import (
    get_chatbot_db,
)

from app.core.models import (
    ChatSession,
    ChatMessage,
)

from app.services.user_service import (
    fetch_user_details,
)

from app.services.langchain_agent import (
    orchestrator,
)

# =========================================
# ROUTER
# =========================================

router = APIRouter()

# =========================================
# REQUEST MODEL
# =========================================

class ChatRequest(BaseModel):

    session_id: str | None = None

    message: str

    user_token: str


# =========================================
# RESPONSE MODEL
# =========================================

class ChatResponse(BaseModel):

    session_id: str

    response: str

    ticket_ids_used: list[int] = Field(
        default_factory=list
    )


# =========================================
# SETTINGS MODEL
# =========================================

class SettingsUpdate(BaseModel):

    ActiveModel: str

    ReformulatorModel: str

    SystemPrompt: str

    ReformulatorPrompt: str

    Temperature: float

    ConfidenceThreshold: float

    EmbeddingModel: str

    RerankerModel: str

    TopK_Tickets: int

    UseReformulator: bool

    UseReranker: bool

    AllowedCategories: str


# =========================================
# CHAT ENDPOINT
# =========================================

@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def handle_chat(
    request: ChatRequest,
    db: Session = Depends(get_chatbot_db),
):

    print("\n" + "=" * 80)
    print("💬 CHAT REQUEST RECEIVED")
    print(f"Message: {request.message}")
    print(f"Session: {request.session_id}")
    print("=" * 80)

    # =====================================
    # AUTH USER
    # =====================================

    try:

        user_data = await fetch_user_details(
            request.user_token
        )

        if not user_data:

            raise Exception(
                "User service returned empty response."
            )

        current_user_id = (
            user_data.get("id")
            or 1
        )

        first_name = (
            user_data.get("firstname")
            or "Guest"
        )

        last_name = (
            user_data.get("lastname")
            or "User"
        )

        user_name = (
            f"{first_name} {last_name}"
        )

        print(
            f"✅ AUTHENTICATED USER: {user_name}"
        )

    except Exception as error:

        print(
            "\n❌ USER AUTH ERROR"
        )

        print(str(error))

        # TEMP FALLBACK
        current_user_id = 1

        user_name = "Guest User"

    # =====================================
    # CREATE / VALIDATE SESSION
    # =====================================

    try:

        if (
            not request.session_id
            or request.session_id.lower() == "null"
            or request.session_id == ""
        ):

            session_id = str(
                uuid.uuid4()
            )

            db.add(
                ChatSession(
                    SessionID=session_id,
                    RequesterUserID=current_user_id,
                )
            )

            db.commit()

            print(
                f"✅ CREATED SESSION: {session_id}"
            )

        else:

            session_id = (
                request.session_id
            )

            existing_session = (
                db.query(ChatSession)
                .filter(
                    ChatSession.SessionID
                    == session_id
                )
                .first()
            )

            if not existing_session:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Chat session not found "
                        "in database."
                    ),
                )

    except Exception as error:

        print(
            "\n❌ SESSION ERROR"
        )

        print(str(error))

        raise HTTPException(
            status_code=500,
            detail=f"Session Error: {str(error)}",
        )

    # =====================================
    # SAVE USER MESSAGE
    # =====================================

    try:

        db.add(
            ChatMessage(
                SessionID=session_id,
                SenderRole="user",
                MessageContent=request.message,
            )
        )

        db.commit()

    except Exception as error:

        print(
            "\n❌ SAVE USER MESSAGE ERROR"
        )

        print(str(error))

    # =====================================
    # GET CHAT HISTORY
    # =====================================

    try:

        history = (
            db.query(ChatMessage)
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

        history_text = "\n".join(
            [
                f"{msg.SenderRole}: "
                f"{msg.MessageContent}"
                for msg in history[:-1]
            ]
        )

    except Exception as error:

        print(
            "\n❌ HISTORY ERROR"
        )

        print(str(error))

        history_text = ""

    # =====================================
    # AI ORCHESTRATOR
    # =====================================

    try:

        print(
            "\n🤖 RUNNING ORCHESTRATOR..."
        )

        ai_response, ticket_ids = (
            orchestrator.orchestrate(
                user_query=request.message,
                chat_history=history_text,
                user_name=user_name,
                db=db,
            )
        )

        print(
            "✅ AI RESPONSE GENERATED"
        )

    except Exception as error:

        print(
            "\n❌ AI ORCHESTRATOR ERROR"
        )

        print(str(error))

        raise HTTPException(
            status_code=500,
            detail=f"AI Error: {str(error)}",
        )

    # =====================================
    # SAVE AI MESSAGE
    # =====================================

    try:

        db.add(
            ChatMessage(
                SessionID=session_id,
                SenderRole="ai",
                MessageContent=ai_response,
            )
        )

        db.commit()

    except Exception as error:

        print(
            "\n❌ SAVE AI MESSAGE ERROR"
        )

        print(str(error))

    # =====================================
    # RETURN RESPONSE
    # =====================================

    return ChatResponse(
        session_id=session_id,
        response=ai_response,
        ticket_ids_used=ticket_ids,
    )


# =========================================
# GET CHAT HISTORY
# =========================================

@router.get(
    "/chat/history/{session_id}",
    tags=["Chat"],
)
async def get_chat_history(
    session_id: str,
    user_token: str,
    db: Session = Depends(get_chatbot_db),
):

    # =====================================
    # VERIFY USER
    # =====================================

    try:

        user_data = await fetch_user_details(
            user_token
        )

        current_user_id = (
            user_data.get("id")
            or 1
        )

    except Exception as error:

        print(
            "\n❌ HISTORY AUTH ERROR"
        )

        print(str(error))

        current_user_id = 1

    # =====================================
    # FIND SESSION
    # =====================================

    session = (
        db.query(ChatSession)
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

    # =====================================
    # SECURITY CHECK
    # =====================================

    if (
        str(session.RequesterUserID)
        != str(current_user_id)
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "Unauthorized. "
                "This chat belongs "
                "to another user."
            ),
        )

    # =====================================
    # LOAD MESSAGES
    # =====================================

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.SessionID
            == session_id
        )
        .order_by(
            ChatMessage.CreatedAt.asc()
        )
        .all()
    )

    # =====================================
    # RETURN HISTORY
    # =====================================

    return {
        "session_id": session_id,

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