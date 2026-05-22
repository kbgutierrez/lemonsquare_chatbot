"""
Conversation resolution service — REFACTORED.
Uses centralized LLM client and prompt templates.
"""
import logging
from app.services.llm_client import create_llm
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
            result = await self.llm.ainvoke(prompt)
            parsed = safe_json_loads(result.content, context="conversation_resolution")

            if not parsed:
                return self._fallback_response()

            resolution_action = str(parsed.get("resolution_action", "") or "").strip().lower()
            conversation_status = str(parsed.get("conversation_status", "") or "").strip().lower()

            if resolution_action not in {"need_ticket", "resolved_chat", "active"}:
                if conversation_status == "need_ticket":
                    resolution_action = "need_ticket"
                elif conversation_status == "resolved_candidate":
                    resolution_action = "resolved_chat"
                else:
                    resolution_action = "active"

            confidence = float(parsed.get("resolution_confidence", 0.0))

            if resolution_action == "need_ticket":
                return {
                    "resolution_action": "need_ticket",
                    "show_resolution_prompt": False,
                    "allow_ticket_submission": True,
                    "conversation_status": "need_ticket",
                    "resolution_confidence": confidence,
                }

            if resolution_action == "resolved_chat":
                return {
                    "resolution_action": "resolved_chat",
                    "show_resolution_prompt": True,
                    "allow_ticket_submission": False,
                    "conversation_status": "resolved_candidate",
                    "resolution_confidence": confidence,
                }

            return {
                "resolution_action": "active",
                "show_resolution_prompt": False,
                "allow_ticket_submission": True,
                "conversation_status": "active",
                "resolution_confidence": confidence,
            }
        except Exception as exc:
            logger.error("Conversation resolution analysis failed: %s", exc, exc_info=True)
            return self._fallback_response()

    @staticmethod
    def _fallback_response() -> dict:
        return {
            "resolution_action": "active",
            "show_resolution_prompt": False,
            "allow_ticket_submission": True,
            "conversation_status": "active",
            "resolution_confidence": 0.0,
        }

