"""
Ticket escalation: drafting and submission.
Extracted from chat_service.py — previously contained both LLM prompting
AND external API calls in a single file.
"""
import json
import logging
import asyncio
import httpx
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.core.exceptions import ValidationError
from app.repositories.chat_repository import ChatRepository
from app.services.chat.message_service import MessageService
from app.services.llm_client import create_llm, invoke_llm

from app.utils.json_utils import clean_llm_json_output, safe_json_loads
from app.services.settings.runtime_config import RuntimeAIConfig

from app.services.routing.routing_engine import suggest_route
from app.schemas.routing import RoutingRequest
from app.services.retrieval.vector_store import get_shared_vector_store
from app.services.retrieval.embedding_provider import get_embedding_model

from app.core.config import settings

logger = logging.getLogger(__name__)
_DRAFT_LOCKS: dict[str, asyncio.Lock] = {}
_DRAFT_LOCKS_GUARD = asyncio.Lock()

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


async def _get_draft_lock(session_id: str) -> asyncio.Lock:
    async with _DRAFT_LOCKS_GUARD:
        return _DRAFT_LOCKS.setdefault(session_id, asyncio.Lock())


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
        draft_lock = await _get_draft_lock(session_id)
        async with draft_lock:
            return await self._draft_escalation_locked(session_id)

    async def _draft_escalation_locked(self, session_id: str) -> dict:
        session = self.repo.validate_session_for_escalation(session_id)
        transcript = self.message_svc.get_transcript(session_id)
        runtime_config = RuntimeAIConfig(self.db)
        if not transcript:
            raise ValidationError("Chat session is empty. Nothing to escalate.")

        # --- 1. MAIN AI EVALUATES (Decides AND Speaks) ---
        main_model = getattr(runtime_config.settings, "ActiveModel", None) or "llama-3.3-70b-versatile"
        main_llm = create_llm(model=main_model, temperature=0.2)
        
        prompt = runtime_config.escalation_draft_prompt.replace(
            "{transcript}", transcript
        )

        result = await invoke_llm(
            main_llm,
            prompt,
            model=main_model,
            action="escalation_evaluator",
            session_id=session_id,
        )
        raw_output = clean_llm_json_output(result.content)
        logger.info("Main AI raw output: %s", raw_output)
        extracted_data = safe_json_loads(raw_output, context="escalation_draft")

        if not extracted_data:
            logger.error("AI failed to generate valid escalation JSON: %s", raw_output)
            raise ValidationError("AI failed to generate a valid escalation draft.")
        
        is_ready = extracted_data.get("is_ready", True)
        
        # --- 2. IF NOT READY: PUSHBACK ---
        if not is_ready:
            logger.info("Escalation rejected by Main AI. Missing info.")
            session.SessionStatus = "Drafting_Ticket"
            self.db.commit()

            pushback_msg = extracted_data.get("chat_message") or "Sige, gawan natin ng ticket. Ano nga pala ang detalye (PC number, location)?"

            self.message_svc.save_ai_message(
                session_id=session_id,
                content=pushback_msg,
            )

            return {
                "status": "needs_info",
                "pushback_message": pushback_msg,
                "summary": None,
                "description": None,
                "department_id": None,
                "department_name": None,
                "subcategory_id": None,
                "subcategory_name": None,
                "routing_confidence": None,
                "routing_reasoning": None,
                "routing_analysis": None,
                "routing_source": None,
            }

        # --- 3. IF READY: INSTANT AI DRAFTS THE TICKET ---
        session.SessionStatus = "Active"
        self.db.commit()
        logger.info("Main AI approved ticket creation. Handing over to Instant AI for drafting...")

        from app.services.prompts import TICKET_GENERATION_PROMPT
        
        instant_model = runtime_config.escalation_draft_model or "llama-3.1-8b-instant"
        instant_llm = create_llm(model=instant_model, temperature=0.0)

        draft_prompt = TICKET_GENERATION_PROMPT.replace("{transcript}", transcript)
        draft_result = await invoke_llm(
            instant_llm,
            draft_prompt,
            model=instant_model,
            action="escalation_draft",
            session_id=session_id,
        )
        draft_raw = clean_llm_json_output(draft_result.content)
        draft_data = safe_json_loads(draft_raw, context="ticket_generation")

        summary = draft_data.get("summary") or "AI Escalation Issue"
        description = draft_data.get("description") or "Escalated from AI Chatbot"
        location = draft_data.get("location") or "Unknown"
        equipment = draft_data.get("equipment") or "Unknown"
        
        logger.info("Instant AI drafted summary='%s', description='%s', location='%s', equipment='%s'", summary, description, location, equipment)

        # --- 4. AI PREDICTS THE ROUTING ---
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
            "location": location,
            "equipment": equipment,
            "department_id": predicted_dept_id,
            "department_name": predicted_dept_name,
            "subcategory_id": predicted_subcat_id,
            "subcategory_name": predicted_subcat_name,
            "routing_confidence": routing_confidence,
            "routing_reasoning": routing_reasoning,
            "routing_analysis": routing_analysis,
            "routing_source": "ai_rac_pipeline",
        }

    async def submit_escalation(self, payload: dict, file: UploadFile = None) -> dict:
        """
        Submit an escalation ticket to BizPortal with conditional fields and optional attachment.
        Returns dict matching TicketEscalateResponse schema.
        """
        session_id = str(payload["session_id"])
        session = self.repo.validate_session_for_escalation(session_id)

        # 1. Define which departments accept the extra fields
        # LMD=87, Motorpool=85, TSD=40
        DEPARTMENTS_WITH_EXTRA_FIELDS = {87, 85, 40}
        
        dept_id = int(payload["department_id"])
        
        # 2. Build the base payload that EVERY department needs
        bizportal_payload = {
            "summary": payload["summary"],
            "description": payload["description"],
            "category_id": dept_id,
            "subcategory_id": payload["subcategory_id"],
            "requester_id": payload["requester_id"],
            "company_id": payload["company_id"],
        }

        # 3. Apply Conditional Logic
        location = payload.get("location") or "Unknown"
        equipment = payload.get("equipment") or "Unknown"

        if dept_id in DEPARTMENTS_WITH_EXTRA_FIELDS:
            # Send as separate fields for LMD, Motorpool, TSD
            bizportal_payload["location"] = location
            bizportal_payload["equipment"] = equipment
        else:
            # For ICT (29) & TMG (81), append to description
            bizportal_payload["description"] = (
                f"{payload['description']}\n\n"
                f"--- Additional Details ---\n"
                f"Location: {location}\n"
                f"Equipment: {equipment}"
            )

        # 4. Handle the File Upload (attachment[])
        files_to_send = None
        if file:
            file_content = await file.read()
            # BizPortal expects the array bracket notation for files
            files_to_send = {'attachment[]': (file.filename, file_content, file.content_type)}

        # 5. Send to BizPortal
        async with httpx.AsyncClient() as client:
            response = await client.post(
                BIZPORTAL_TICKET_URL,
                data=bizportal_payload, # Use data for multipart form data
                files=files_to_send,
                timeout=10.0,
            )
            response.raise_for_status()

        self.repo.escalate_session(session_id)

        return {
            "status": "success",
            "message": "Ticket successfully sent to live agents.",
            "bizportal_response": response.text,
        }
