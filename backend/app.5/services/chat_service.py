import json
import logging
import uuid

import httpx
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import (
    AuthorizationError,
    NotFoundError,
    ValidationError,
)
from app.models.chatbot import ChatMessage, ChatSession

logger = logging.getLogger(__name__)

HISTORY_WINDOW = 6


def get_or_create_session(
    db: Session,
    session_id,
    user_id: int,
) -> str:
    is_new_session = (
        not session_id
        or str(session_id).lower() == "null"
        or str(session_id).strip() == ""
    )

    if is_new_session:
        new_id = str(uuid.uuid4())

        db.add(
            ChatSession(
                SessionID=new_id,
                RequesterUserID=user_id,
                SessionStatus="Active",
                IsActive=True,
            )
        )

        db.commit()

        logger.info(
            "Created new chat session %s for user %d",
            new_id,
            user_id,
        )

        return new_id

    normalized_session_id = str(session_id)

    existing = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == normalized_session_id)
        .first()
    )

    if not existing:
        raise NotFoundError(
            f"Chat session '{normalized_session_id}' not found."
        )

    return normalized_session_id


def save_message(
    db: Session,
    session_id: str,
    role: str,
    content: str,
) -> None:
    db.add(
        ChatMessage(
            SessionID=session_id,
            SenderRole=role,
            MessageContent=content,
        )
    )

    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )

    if session:
        session.LastActive = None

    db.commit()


def get_recent_history_text(
    db: Session,
    session_id: str,
) -> str:
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.SessionID == session_id)
        .order_by(ChatMessage.CreatedAt.desc())
        .limit(HISTORY_WINDOW)
        .all()
    )

    messages.reverse()

    history_messages = messages[:-1]

    return "\n".join(
        f"{msg.SenderRole}: {msg.MessageContent}"
        for msg in history_messages
    )


def get_session_with_auth_check(
    db: Session,
    session_id: str,
    user_id: int,
) -> ChatSession:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )

    if not session:
        raise NotFoundError(
            f"Chat session '{session_id}' not found."
        )

    if str(session.RequesterUserID) != str(user_id):
        raise AuthorizationError(
            "This chat session belongs to another user."
        )

    return session


def get_all_messages(
    db: Session,
    session_id: str,
) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.SessionID == session_id)
        .order_by(ChatMessage.CreatedAt.asc())
        .all()
    )


async def draft_ticket_escalation(
    session_id: str,
    db: Session,
    ingestion_service=None,
) -> dict:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == str(session_id))
        .first()
    )

    if not session:
        raise ValidationError("Chat session not found.")

    if not session.IsActive:
        raise ValidationError(
            "Archived sessions cannot be escalated."
        )

    current_status = (
        session.SessionStatus or "Active"
    ).strip()

    blocked_statuses = {
        "Resolved",
        "Escalated",
        "Archived",
    }

    if current_status in blocked_statuses:
        raise ValidationError(
            f"Cannot escalate a '{current_status}' session."
        )

    messages = get_all_messages(db, str(session_id))

    if not messages:
        raise ValidationError(
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

        raise ValidationError(
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

    routing_prediction = {
        "department_id": 29,
        "department_name": "ICT",
        "subcategory_id": 11200,
        "subcategory_name": "OTHERS",
        "confidence": 0.0,
        "routing_source": "fallback_default",
    }

    return {
        "status": "success",
        "summary": summary,
        "description": description,
        "department_id": routing_prediction["department_id"],
        "department_name": routing_prediction["department_name"],
        "subcategory_id": routing_prediction["subcategory_id"],
        "subcategory_name": routing_prediction["subcategory_name"],
        "routing_confidence": routing_prediction["confidence"],
        "routing_source": routing_prediction["routing_source"],
    }


async def submit_ticket_escalation(
    payload: dict,
    db: Session,
) -> dict:
    session_id = str(payload["session_id"])

    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )

    if not session:
        raise ValidationError(
            "Chat session not found."
        )

    if not session.IsActive:
        raise ValidationError(
            "Archived sessions cannot be escalated."
        )

    current_status = (
        session.SessionStatus or "Active"
    ).strip()

    blocked_statuses = {
        "Resolved",
        "Escalated",
        "Archived",
    }

    if current_status in blocked_statuses:
        raise ValidationError(
            f"Cannot escalate a '{current_status}' session."
        )

    url = "https://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/send/ticket/"

    bizportal_payload = {
        "description": payload["description"],
        "category_id": payload["department_id"],
        "subcategory_id": payload["subcategory_id"],
        "requester_id": payload["requester_id"],
        "company_id": payload["company_id"],
        "summary": payload["summary"],
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=bizportal_payload,
            timeout=10.0,
        )

        response.raise_for_status()

    session.SessionStatus = "Escalated"

    db.commit()

    return {
        "status": "success",
        "message": "Ticket successfully sent to live agents.",
        "bizportal_response": response.text,
    }


def archive_session(
    db: Session,
    session_id: str,
) -> None:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.SessionID == session_id)
        .first()
    )

    if not session:
        raise NotFoundError(
            f"Chat session '{session_id}' not found."
        )

    session.IsActive = False
    session.SessionStatus = "Archived"

    db.commit()

    logger.info(
        "Session %s archived successfully.",
        session_id,
    )


def archive_all_user_sessions(
    db: Session,
    requester_id: int,
) -> int:
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.RequesterUserID == requester_id)
        .filter(ChatSession.IsActive == True)
        .all()
    )

    for session in sessions:
        session.IsActive = False
        session.SessionStatus = "Archived"

    db.commit()

    return len(sessions)