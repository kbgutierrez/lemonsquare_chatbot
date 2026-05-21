import logging

from langchain_groq import ChatGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

_RESOLUTION_ANALYZER_PROMPT = """
You are a conversation resolution analyzer for an IT Helpdesk AI assistant.

Your job is to determine whether the user's issue APPEARS to be resolved based on:
- the latest user message
- the AI response
- recent conversation history

You MUST return ONLY valid JSON.

Rules:
- Be conservative.
- Only mark as resolved_candidate if the user strongly implies:
  - satisfaction
  - completion
  - success
  - no more assistance needed
  - gratitude after a solution
  - confirmation that the issue worked

Examples of likely resolved:
- "thanks it worked"
- "okay fixed now"
- "problem solved"
- "thank you"
- "that's all"
- "resolved already"

Examples of NOT resolved:
- frustration
- confusion
- follow-up questions
- troubleshooting still ongoing
- errors still occurring
- escalation requests

Return EXACTLY this JSON schema:

{
  "show_resolution_prompt": boolean,
  "allow_ticket_submission": boolean,
  "conversation_status": "active" | "resolved_candidate",
  "resolution_confidence": float
}

Conversation History:
{chat_history}

Latest User Message:
{user_query}

AI Response:
{ai_response}

JSON Output:
"""


class ConversationResolutionService:
    """
    Lightweight post-response conversation analyzer.

    IMPORTANT:
    - Runs AFTER RAG generation.
    - Does NOT affect retrieval quality.
    - Does NOT modify generated answers.
    - Used ONLY for frontend UX intent metadata.
    """

    def __init__(self) -> None:
        self.llm = ChatGroq(
            model=settings.CLASSIFIER_MODEL,
            temperature=0.0,
            api_key=settings.GROQ_API_KEY,
        )

    async def analyze_conversation(
        self,
        user_query: str,
        ai_response: str,
        chat_history: str,
    ) -> dict:
        try:
            prompt = _RESOLUTION_ANALYZER_PROMPT.format(
                user_query=user_query,
                ai_response=ai_response,
                chat_history=chat_history or "No previous history.",
            )

            result = await self.llm.ainvoke(prompt)

            raw_output = result.content.strip()

            if raw_output.startswith("```json"):
                raw_output = raw_output[7:-3].strip()

            elif raw_output.startswith("```"):
                raw_output = raw_output[3:-3].strip()

            import json

            parsed = json.loads(raw_output)

            return {
                "show_resolution_prompt": bool(
                    parsed.get(
                        "show_resolution_prompt",
                        False,
                    )
                ),

                "allow_ticket_submission": bool(
                    parsed.get(
                        "allow_ticket_submission",
                        True,
                    )
                ),

                "conversation_status": (
                    parsed.get(
                        "conversation_status",
                        "active",
                    )
                ),

                "resolution_confidence": float(
                    parsed.get(
                        "resolution_confidence",
                        0.0,
                    )
                ),
            }

        except Exception as exc:
            logger.error(
                "Conversation resolution analysis failed: %s",
                exc,
                exc_info=True,
            )

            return {
                "show_resolution_prompt": False,
                "allow_ticket_submission": True,
                "conversation_status": "active",
                "resolution_confidence": 0.0,
            }


conversation_resolution_service = (
    ConversationResolutionService()
)