"""
Ticket escalation: drafting and submission.
Extracted from chat_service.py — previously contained both LLM prompting
AND external API calls in a single file.
"""
import json
import logging
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import ValidationError
from app.repositories.chat_repository import ChatRepository
from app.services.chat.message_service import MessageService
from app.services.llm_client import create_llm
from app.services.prompts import ESCALATION_DRAFT_PROMPT
from app.utils.json_utils import clean_llm_json_output, safe_json_loads

logger = logging.getLogger(__name__)

# Fallback routing when AI routing is unavailable
FALLBACK_ROUTING = {
    "department_id": 29,
    "department_name": "ICT",
    "subcategory_id": 11200,
    "subcategory_name": "OTHERS",
    "confidence": 0.0,
    "routing_source": "fallback_default",
}

BIZPORTAL_TICKET_URL = (
    "https://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/send/ticket/"
)


class EscalationService:
    """Handles escalation draft generation and ticket submission."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRepository(db)
        self.message_svc = MessageService(db)

    async def draft_escalation(self, session_id: str) -> dict:
        """
        Generate a ticket escalation draft from chat transcript.
        Returns dict matching TicketDraftResponse schema.
        """
        session = self.repo.validate_session_for_escalation(session_id)
        transcript = self.message_svc.get_transcript(session_id)
        if not transcript:
            raise ValidationError("Chat session is empty. Nothing to escalate.")

        llm = create_llm(model="llama-3.1-8b-instant", temperature=0.0)
        prompt = ESCALATION_DRAFT_PROMPT.format(transcript=transcript)

        result = await llm.ainvoke(prompt)
        raw_output = clean_llm_json_output(result.content)
        extracted_data = safe_json_loads(raw_output, context="escalation_draft")

        if not extracted_data:
            logger.error("AI failed to generate valid escalation JSON: %s", raw_output)
            raise ValidationError("AI failed to generate a valid escalation draft.")

        summary = extracted_data.get("summary") or "AI Escalation Issue"
        description = extracted_data.get("description") or "Escalated from AI Chatbot"
        routing = FALLBACK_ROUTING

        return {
            "status": "success",
            "summary": summary,
            "description": description,
            "department_id": routing["department_id"],
            "department_name": routing["department_name"],
            "subcategory_id": routing["subcategory_id"],
            "subcategory_name": routing["subcategory_name"],
            "routing_confidence": routing["confidence"],
            "routing_source": routing["routing_source"],
        }

    async def submit_escalation(self, payload: dict) -> dict:
        """
        Submit an escalation ticket to BizPortal.
        Returns dict matching TicketEscalateResponse schema.
        """
        session_id = str(payload["session_id"])
        session = self.repo.validate_session_for_escalation(session_id)

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
                BIZPORTAL_TICKET_URL,
                json=bizportal_payload,
                timeout=10.0,
            )
            response.raise_for_status()

        self.repo.escalate_session(session_id)

        return {
            "status": "success",
            "message": "Ticket successfully sent to live agents.",
            "bizportal_response": response.text,
        }
