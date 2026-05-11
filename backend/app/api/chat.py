import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.services.user_service import fetch_user_details

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

    user_token: str


class ChatResponse(BaseModel):

    session_id: str

    response: str

    ticket_ids_used: list[int] = Field(
        default_factory=list
    )


from pydantic import BaseModel

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


@router.post("/chat", response_model=ChatResponse)
async def handle_chat(
    request: ChatRequest,
    db: Session = Depends(get_chatbot_db),
):
    # 1. AUTHENTICATE EXTERNAL USER
    user_data = await fetch_user_details(request.user_token)
    current_user_id = user_data.get("id")
    user_name = f"{user_data.get('firstname')} {user_data.get('lastname')}"

    # 2. CREATE OR VALIDATE SESSION
    if (
        not request.session_id
        or request.session_id.lower() == "null"
        or request.session_id == ""
    ):
        session_id = str(uuid.uuid4())
        db.add(
            ChatSession(
                SessionID=session_id,
                RequesterUserID=current_user_id,
            )
        )
        db.commit()
    else:
        session_id = request.session_id
        existing_session = (
            db.query(ChatSession)
            .filter(ChatSession.SessionID == session_id)
            .first()
        )
        if not existing_session:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found in database.",
            )

    # 3. SAVE USER MESSAGE
    db.add(
        ChatMessage(
            SessionID=session_id,
            SenderRole="user",
            MessageContent=request.message,
        )
    )
    db.commit()

    # 4. GET HISTORY
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.SessionID == session_id)
        .order_by(ChatMessage.CreatedAt.desc())
        .limit(6)
        .all()
    )
    history.reverse()
    
    history_text = "\n".join([
        f"{msg.SenderRole}: {msg.MessageContent}"
        for msg in history[:-1]
    ])

    # 5. CALL AI ORCHESTRATOR
    try:
        ai_response, ticket_ids = orchestrator.orchestrate(
            user_query=request.message,
            chat_history=history_text,
            user_name=user_name,
            db=db,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Error: {str(e)}",
        )

    # 6. SAVE AI MESSAGE
    db.add(
        ChatMessage(
            SessionID=session_id,
            SenderRole="ai",
            MessageContent=ai_response,
        )
    )
    db.commit()

    # 7. RETURN FINAL RESPONSE (Make sure this is perfectly aligned here!)
    return ChatResponse(
        session_id=session_id,
        response=ai_response,
        ticket_ids_used=ticket_ids,
    )


# =========================================
# GET CHAT HISTORY
# =========================================
@router.get("/chat/history/{session_id}", tags=["Chat"])
async def get_chat_history(
    session_id: str, 
    user_token: str, 
    db: Session = Depends(get_chatbot_db)
):
    # 1. Verify who is asking using the BizPortal API
    user_data = await fetch_user_details(user_token)
    current_user_id = user_data.get("id")

    # 2. Check the database for the session
    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404, 
            detail="Chat session not found."
        )
        
    # 3. THE SECURITY LOCK: Does this chat belong to this user?
    # Make sure we compare the integer IDs
    if str(session.RequesterUserID) != str(current_user_id):
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized. This chat belongs to another user."
        )
        
    # 4. Fetch the messages
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.SessionID == session_id)
        .order_by(ChatMessage.CreatedAt.asc())
        .all()
    )

    # 5. Return the formatted data
    return {
        "session_id": session_id,
        "messages": [
            {
                "MessageID": msg.MessageID,
                "SessionID": msg.SessionID,
                "SenderRole": msg.SenderRole,
                "MessageContent": msg.MessageContent,
                "CreatedAt": msg.CreatedAt,
            }
            for msg in messages
        ],
    }