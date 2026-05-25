"""
Ticket escalation: drafting and submission.
Extracted from chat_service.py — previously contained both LLM prompting
AND external API calls in a single file.
"""
import json
import logging
import httpx
from sqlalchemy.orm import Session
from app.core.exceptions import ValidationError
from app.repositories.chat_repository import ChatRepository
from app.services.chat.message_service import MessageService
from app.services.llm_client import create_llm

from app.utils.json_utils import clean_llm_json_output, safe_json_loads
from app.services.settings.runtime_config import RuntimeAIConfig

from app.services.routing.routing_engine import suggest_route
from app.schemas.routing import RoutingRequest
from app.services.retrieval.vector_store import get_shared_vector_store
from app.services.retrieval.embedding_provider import get_embedding_model

from app.core.config import settings

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

BIZPORTAL_TICKET_URL = settings.BIZPORTAL_TICKET_URL


class EscalationService:
    """Handles escalation draft generation and ticket submission."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRepository(db)
        self.message_svc = MessageService(db)


    async def draft_escalation(self, session_id: str) -> dict:
        """
        Generate a ticket escalation draft, then pass it to the routing engine.
        Returns dict matching TicketDraftResponse schema.
        """
        session = self.repo.validate_session_for_escalation(session_id)
        transcript = self.message_svc.get_transcript(session_id)
        runtime_config = RuntimeAIConfig(self.db)
        if not transcript:
            raise ValidationError("Chat session is empty. Nothing to escalate.")

        # --- 1. AI DRAFTS THE TICKET ---
        llm = create_llm(model=runtime_config.escalation_draft_model, temperature=0.0)
        
        prompt = runtime_config.escalation_draft_prompt.replace(
            "{transcript}", transcript
        )

        result = await llm.ainvoke(prompt)
        raw_output = clean_llm_json_output(result.content)
        logger.info("Escalation LLM raw output: %s", raw_output)
        extracted_data = safe_json_loads(raw_output, context="escalation_draft")

        if not extracted_data:
            logger.error("AI failed to generate valid escalation JSON: %s", raw_output)
            raise ValidationError("AI failed to generate a valid escalation draft.")

        summary = extracted_data.get("summary") or "AI Escalation Issue"
        description = extracted_data.get("description") or "Escalated from AI Chatbot"
        logger.info("Escalation draft parsed summary='%s', description='%s'", summary, description)

        # --- 2. AI PREDICTS THE ROUTING ---
        try:
            logger.info("Passing drafted ticket to Routing Engine...")
            vector_store = get_shared_vector_store()
            embeddings = get_embedding_model()
            
            routing_req = RoutingRequest(summary=summary, description=description)
            
            routing_response = await suggest_route(
                request=routing_req,
                db=self.db,
                qdrant=vector_store.qdrant,
                embeddings=embeddings,
                collection_name=settings.QDRANT_ROUTING_COLLECTION,
            )
            
            # Extract predictions from RoutingResponse
            suggestion = routing_response.suggestion
            predicted_dept_id = suggestion.department_id
            predicted_subcat_id = suggestion.subcategory_id
            predicted_dept_name = suggestion.department_name
            predicted_subcat_name = suggestion.subcategory_name
            routing_confidence = suggestion.confidence_score
            routing_reasoning = suggestion.reasoning
            routing_analysis = suggestion.analysis
            routing_source = "ai_rac_pipeline"
            logger.info(
                "Escalation routing chosen department=%s (%s), subcategory=%s (%s), confidence=%s",
                predicted_dept_name,
                predicted_dept_id,
                predicted_subcat_name,
                predicted_subcat_id,
                routing_confidence,
            )
            logger.info("Escalation routing analysis: %s", routing_analysis)
            
        except Exception as e:
            logger.error("Routing engine failed during escalation draft: %s", e)
            # Safe fallback if the routing engine crashes
            predicted_dept_id = FALLBACK_ROUTING["department_id"]
            predicted_subcat_id = FALLBACK_ROUTING["subcategory_id"]
            predicted_dept_name = FALLBACK_ROUTING["department_name"]
            predicted_subcat_name = FALLBACK_ROUTING["subcategory_name"]
            routing_confidence = 0.0
            routing_reasoning = "Routing engine failed."
            routing_source = FALLBACK_ROUTING["routing_source"]
            routing_analysis = "Routing engine failed."

        # --- 3. RETURN COMBO TO FRONTEND ---
        return {
            "status": "success",
            "summary": summary,
            "description": description,
            "department_id": predicted_dept_id,
            "department_name": predicted_dept_name,
            "subcategory_id": predicted_subcat_id,
            "subcategory_name": predicted_subcat_name,
            "routing_confidence": routing_confidence,
            "routing_reasoning": routing_reasoning,
            "routing_analysis": routing_analysis,
            "routing_source": "ai_rac_pipeline",
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
