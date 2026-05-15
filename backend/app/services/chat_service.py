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




async def escalate_to_agent(session_id: str, requester_id: int, company_id: int, db: Session) -> dict:
    """Summarizes the chat and sends it to the BizPortal Ticket API."""
    
    # 1. Fetch Chat History
    messages = get_all_messages(db, session_id)
    if not messages:
        raise ValueError("Chat session is empty. Nothing to escalate.")

    transcript = "\n".join([f"{msg.SenderRole.upper()}: {msg.MessageContent}" for msg in messages])

    # 2. Use LLM to Summarize
    llm = ChatGroq(
        model="llama-3.1-8b-instant", # Fast model for simple JSON extraction
        temperature=0.0,
        api_key=settings.GROQ_API_KEY,
    )
    

    prompt = (
        "You are an expert Helpdesk Dispatcher. Read the chat transcript and extract the details to create a ticket.\n"
        "You MUST output EXACTLY a valid JSON object with these two keys: 'summary' and 'description'.\n"
        "\n"
        "Rules for 'summary':\n"
        "- A short, 3 to 6 word title of the issue.\n"
        "\n"
        "Rules for 'description':\n"
        "- Keep it extremely concise and natural, like a technician's log (1 to 5 sentences maximum).\n"
        "- Use a neutral, third-person perspective. NEVER use first-person pronouns (do NOT use 'kami', 'namin', 'I', or 'we').\n"
        "- State exactly what the reported issue is and what the AI already attempted.\n"
        "- Match the language of the transcript perfectly (e.g., Tagalog or English).\n"
        "- Example of a good description: 'Hindi maayos ang agos ng drainage sa lababo. Na-check na kung may bara pero wala naman nakita kaya in-advise na ipa-check na sa Helpdesk staff.'\n"
        "\n"
        "Do NOT include markdown formatting (like ```json). Output raw JSON only.\n\n"
        f"Transcript:\n{transcript}\n\n"
        "JSON Output:"
    )
    
    result = await llm.ainvoke(prompt)
    raw_output = result.content.strip()
    
    # Clean up markdown if the LLM hallucinated it
    if raw_output.startswith("```json"):
        raw_output = raw_output[7:-3].strip()
    elif raw_output.startswith("```"):
        raw_output = raw_output[3:-3].strip()

    try:
        extracted_data = json.loads(raw_output)
    except json.JSONDecodeError:
        raise ValueError("AI failed to generate a valid summary for the ticket.")

    # 3. Send to BizPortal API
    url = "https://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/send/ticket/"    
    payload = {
        "description": extracted_data.get("description", "Escalated from AI Chatbot"),
        "category_id": 29, 
        "subcategory_id": 11188,
        "requester_id": requester_id,   
        "company_id": company_id,
        "summary": extracted_data.get("summary", "AI Escalation Issue")
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=10.0)
        response.raise_for_status()
        
        return {
            "status": "success",
            "message": "Ticket successfully sent to live agents.",
            "bizportal_response": response.text
        }
