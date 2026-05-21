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

            return {
                "show_resolution_prompt": bool(parsed.get("show_resolution_prompt", False)),
                "allow_ticket_submission": bool(parsed.get("allow_ticket_submission", True)),
                "conversation_status": parsed.get("conversation_status", "active"),
                "resolution_confidence": float(parsed.get("resolution_confidence", 0.0)),
            }
        except Exception as exc:
            logger.error("Conversation resolution analysis failed: %s", exc, exc_info=True)
            return self._fallback_response()

    @staticmethod
    def _fallback_response() -> dict:
        return {
            "show_resolution_prompt": False,
            "allow_ticket_submission": True,
            "conversation_status": "active",
            "resolution_confidence": 0.0,
        }

