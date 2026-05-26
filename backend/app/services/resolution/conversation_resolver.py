"""
Conversation resolution service — REFACTORED.
Uses centralized LLM client and prompt templates.
"""
import logging
from app.services.llm_client import create_llm, invoke_llm
from sqlalchemy.orm import Session
from app.services.settings.runtime_config import RuntimeAIConfig
from app.utils.json_utils import safe_json_loads

logger = logging.getLogger(__name__)


class ConversationResolutionService:
    """
    Lightweight post-response conversation analyzer.
    Runs AFTER RAG generation. Does NOT affect retrieval or answers.
    """

    def __init__(self, db: Session) -> None:
        self.runtime_config = RuntimeAIConfig(db)

        self.llm = create_llm(
            model=self.runtime_config.conversation_resolution_model,
            temperature=0.0,
        )

    async def analyze_conversation(
        self,
        user_query: str,
        ai_response: str,
        chat_history: str,
    ) -> dict:
        try:
            prompt = self.runtime_config.conversation_resolution_prompt.format(
                user_query=user_query,
                ai_response=ai_response,
                chat_history=chat_history or "No previous history.",
            )
            result = await invoke_llm(
                self.llm,
                prompt,
                model=self.runtime_config.conversation_resolution_model,
                action="conversation_resolution",
            )
            raw_content = result.content
            logger.info("🔍 RESOLUTION RAW OUTPUT: %s", raw_content)

            parsed = safe_json_loads(raw_content, context="conversation_resolution")

            if not parsed:
                logger.warning("⚠️ RESOLUTION PARSE FAILED - FALLBACK USED")
                return self._fallback_response()

            # Using the new, clean categorical logic!
            action = str(parsed.get("action", "none")).strip().lower()
            resolution_message = parsed.get("resolution_message")
            
            # Default values
            show_resolution_prompt = False
            allow_ticket_submission = False
            conversation_status = "active"
            resolution_action = "active"
            confidence = 1.0 # High confidence for categorical choice

            if action == "show_ticket":
                show_resolution_prompt = False # Hide resolve button
                allow_ticket_submission = True # Show ticket button
                conversation_status = "need_ticket"
                resolution_action = "need_ticket"
            elif action == "show_resolve":
                show_resolution_prompt = True # Show resolve button
                allow_ticket_submission = False # Hide ticket button
                conversation_status = "resolved_candidate"
                resolution_action = "resolved_chat"
            else:
                # 'none' action
                show_resolution_prompt = False
                allow_ticket_submission = False
                conversation_status = "active"
                resolution_action = "active"

            response_data = {
                "resolution_action": resolution_action,
                "show_resolution_prompt": show_resolution_prompt,
                "allow_ticket_submission": allow_ticket_submission,
                "conversation_status": conversation_status,
                "resolution_confidence": confidence,
                "resolution_message": resolution_message,
            }

            logger.info("✅ RESOLUTION ANALYZED: %s", response_data)
            return response_data
        except Exception as exc:
            logger.error("Conversation resolution analysis failed: %s", exc, exc_info=True)
            return self._fallback_response()

    @staticmethod
    def _fallback_response() -> dict:
        return {
            "resolution_action": "active",
            "show_resolution_prompt": False,
            "allow_ticket_submission": False,
            "conversation_status": "active",
            "resolution_confidence": 0.0,
            "resolution_message": None,
        }

