"""
Chat session and message persistence service.

WHY this service exists:
  The original chat.py endpoint handler contained all session creation,
  validation, message saving, and history retrieval logic inline —
  roughly 120 lines of database operations mixed with HTTP handling.

  Extracting these into a service:
  - Makes the route handler a thin orchestration layer (~30 lines).
  - Allows all DB logic to be unit-tested without a FastAPI test client.
  - Centralises session validation so other future endpoints can reuse it.
"""

import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, AuthorizationError
from app.models.chatbot import ChatSession, ChatMessage

import json
import httpx
from langchain_groq import ChatGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Number of recent messages to load as context for the AI.
HISTORY_WINDOW = 6


def get_or_create_session(
    db: Session,
    session_id: str | None,
    user_id: int,
) -> str:
    """
    Return an existing session ID or create and persist a new one.

    Args:
        db: SQLAlchemy session.
        session_id: The ID from the client request (may be None or empty).
        user_id: The authenticated user's ID.

    Returns:
        The session ID string to use for this request.

    Raises:
        NotFoundError: If a session_id was provided but doesn't exist in DB.
    """
    is_new_session = (
        not session_id
        or session_id.lower() == "null"
        or session_id.strip() == ""
    )

    if is_new_session:
        new_id = str(uuid.uuid4())
        db.add(ChatSession(SessionID=new_id, RequesterUserID=user_id))
        db.commit()
        logger.info("Created new chat session %s for user %d", new_id, user_id)
        return new_id

    existing = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )
    if not existing:
        raise NotFoundError(f"Chat session '{session_id}' not found.")

    return session_id


def save_message(db: Session, session_id: str, role: str, content: str) -> None:
    """Persist a single message to the database."""
    db.add(
        ChatMessage(
            SessionID=session_id,
            SenderRole=role,
            MessageContent=content,
        )
    )
    db.commit()


def get_recent_history_text(db: Session, session_id: str) -> str:
    """
    Fetch the last HISTORY_WINDOW messages for a session and format them
    as a plain-text string for the AI prompt.

    The current user message (the last one just saved) is excluded from
    the history string — it is passed to the AI separately as user_query.
    """
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.SessionID == session_id)
        .order_by(ChatMessage.CreatedAt.desc())
        .limit(HISTORY_WINDOW)
        .all()
    )
    messages.reverse()

    # Exclude the last message (the one we just saved — the current query).
    history_messages = messages[:-1]

    return "\n".join(
        f"{msg.SenderRole}: {msg.MessageContent}" for msg in history_messages
    )


def get_session_with_auth_check(
    db: Session,
    session_id: str,
    user_id: int,
) -> ChatSession:
    """
    Retrieve a session, verifying the requesting user owns it.

    Raises:
        NotFoundError: If the session does not exist.
        AuthorizationError: If the session belongs to a different user.
    """
    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )
    if not session:
        raise NotFoundError(f"Chat session '{session_id}' not found.")

    if str(session.RequesterUserID) != str(user_id):
        raise AuthorizationError("This chat session belongs to another user.")

    return session


def get_all_messages(db: Session, session_id: str) -> list[ChatMessage]:
    """Return all messages for a session, ordered chronologically."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.SessionID == session_id)
        .order_by(ChatMessage.CreatedAt.asc())
        .all()
    )




import json
import httpx
from langchain_groq import ChatGroq
from app.core.config import settings

async def draft_ticket_escalation(
    session_id: str,
    db: Session,
    ingestion_service=None,
) -> dict:
    """
    Step 1:
    AI summarizes the chat into a structured ticket draft.

    Future-ready architecture:
    - Supports routing-aware escalation
    - Supports AI category prediction
    - Supports confidence scoring
    - Supports explainable routing metadata

    Current state:
    - Summary/description generation is active
    - Routing fallback is static until routing_service is implemented
    """

    messages = get_all_messages(db, session_id)

    if not messages:
        raise ValueError(
            "Chat session is empty. Nothing to escalate."
        )

    transcript = "\n".join(
        [
            f"{msg.SenderRole.upper()}: {msg.MessageContent}"
            for msg in messages
        ]
    )

    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.0,
        api_key=settings.GROQ_API_KEY,
    )

    prompt = (
        "You are an expert Helpdesk Dispatcher.\n"
        "Read the chat transcript and extract the issue into a clean operational ticket.\n\n"

        "You MUST output EXACTLY a valid JSON object with these keys:\n"
        "- summary\n"
        "- description\n\n"

        "Rules for summary:\n"
        "- 3 to 8 words only\n"
        "- Operational issue title\n"
        "- No punctuation spam\n\n"

        "Rules for description:\n"
        "- Extremely concise\n"
        "- Neutral technician-style wording\n"
        "- Mention reported issue\n"
        "- Mention attempted troubleshooting if present\n"
        "- 1 to 5 sentences maximum\n"
        "- Match transcript language naturally\n"
        "- NEVER use first-person pronouns\n\n"

        "Do NOT include markdown.\n"
        "Output RAW JSON ONLY.\n\n"

        f"Transcript:\n{transcript}\n\n"

        "JSON Output:"
    )

    result = await llm.ainvoke(prompt)

    raw_output = result.content.strip()

    # Defensive cleanup for markdown-wrapped responses
    if raw_output.startswith("```json"):
        raw_output = raw_output[7:-3].strip()

    elif raw_output.startswith("```"):
        raw_output = raw_output[3:-3].strip()

    try:
        extracted_data = json.loads(raw_output)

    except json.JSONDecodeError as exc:
        logger.error(
            "AI failed to generate valid escalation JSON: %s",
            raw_output,
        )

        raise ValueError(
            "AI failed to generate a valid escalation draft."
        ) from exc

    summary = (
        extracted_data.get("summary")
        or "AI Escalation Issue"
    )

    description = (
        extracted_data.get("description")
        or "Escalated from AI Chatbot"
    )

    # =========================================================
    # FUTURE ROUTING-AWARE SECTION
    # =========================================================
    #
    # Current temporary behavior:
    # - static routing fallback
    #
    # Future behavior:
    # routing_service.predict_route(
    #     summary=summary,
    #     description=description
    # )
    #
    # Example future output:
    #
    # {
    #     "department_id": "29",
    #     "department_name": "ICT",
    #     "subcategory_id": "11214",
    #     "subcategory_name": "ASRS",
    #     "confidence": 0.94
    # }
    #
    # =========================================================

    routing_prediction = {
        "department_id": "29",
        "department_name": "ICT",
        "subcategory_id": "11200",
        "subcategory_name": "OTHERS",
        "confidence": 0.0,
        "routing_source": "fallback_default",
    }

    logger.info(
        "Drafted escalation for session=%s | summary=%s",
        session_id,
        summary,
    )

    return {
        "status": "success",

        "summary": summary,
        "description": description,

        # ============================================
        # ROUTING-AWARE RESPONSE
        # ============================================

        "department_id":
            routing_prediction["department_id"],

        "department_name":
            routing_prediction["department_name"],

        "subcategory_id":
            routing_prediction["subcategory_id"],

        "subcategory_name":
            routing_prediction["subcategory_name"],

        "routing_confidence":
            routing_prediction["confidence"],

        "routing_source":
            routing_prediction["routing_source"],
    }

async def submit_ticket_escalation(payload: dict, db: Session) -> dict:
    """Step 2: Takes the final text AND routing data, and sends it to BizPortal."""
    url = "https://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/send/ticket/"
    
    bizportal_payload = {
        "description": payload["description"],
        "category_id": payload["department_id"],   # <--- REPLACED HARDCODED 29
        "subcategory_id": payload["subcategory_id"], # <--- REPLACED HARDCODED 11188
        "requester_id": payload["requester_id"],
        "company_id": payload["company_id"],
        "summary": payload["summary"]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=bizportal_payload, timeout=10.0)
        response.raise_for_status()
        
        # Update the database status to Escalated
        from app.models.chatbot import ChatSession
        session = db.query(ChatSession).filter(ChatSession.SessionID == payload["session_id"]).first()
        if session:
            session.SessionStatus = "Escalated"
            db.commit()
            
        return {
            "status": "success",
            "message": "Ticket successfully sent to live agents.",
            "bizportal_response": response.text
        }



def archive_session(db: Session, session_id: str) -> None:
    """Soft-delete a chat session by setting IsActive to 0 (False)."""
    from app.models.chatbot import ChatSession
    
    # Bulletproof direct SQL update (Using 0 ensures SQL Server BIT/INT compatibility)
    updated_rows = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .update({"IsActive": 0}, synchronize_session=False) 
    )
    db.commit()

    if updated_rows == 0:
        logger.warning(f"Chat session '{session_id}' not found for archiving.")
    else:
        logger.info("Session %s archived (soft-deleted).", session_id)


def archive_all_user_sessions(db: Session, requester_id: int) -> int:
    """Soft-deletes all active chat sessions for a specific user."""
    from app.models.chatbot import ChatSession

    # Bulletproof direct SQL update for all user sessions at once
    updated_count = (
        db.query(ChatSession)
        .filter(ChatSession.RequesterUserID == requester_id)
        # Using == 1 to catch active sessions safely across all SQL Server types
        .filter(ChatSession.IsActive == 1) 
        .update({"IsActive": 0}, synchronize_session=False)
    )
    db.commit()
    
    if updated_count > 0:
        logger.info("Archived %d sessions for user %d.", updated_count, requester_id)
        
    return updated_count
