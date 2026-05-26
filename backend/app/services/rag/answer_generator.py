"""
Answer generation service.
Formats context and generates final AI response via LLM.
Extracted from SupportOrchestrator._run_pipeline().
"""
import logging
from app.services.llm_client import create_llm, invoke_llm
from app.core.retrieval_models import RetrievalDocument

logger = logging.getLogger(__name__)


class AnswerGenerator:
    """Generates the final AI response from retrieved context."""

    async def generate(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        documents: list[RetrievalDocument],
        system_prompt: str,
        model: str,
        temperature: float,
    ) -> str:
        """
        Generate an answer from the retrieved documents.

        Args:
            user_query: Original user query.
            chat_history: Conversation history text.
            user_name: Name of the user.
            documents: Filtered retrieval documents.
            system_prompt: System prompt from settings.
            model: LLM model name.
            temperature: Sampling temperature.

        Returns:
            Generated answer string.
        """
        formatted_chunks = [doc.format_for_prompt() for doc in documents]
        context = "\n\n---\n\n".join(formatted_chunks)

        final_prompt = (
            f"{system_prompt}\n"
            f"The user you are speaking to is named: {user_name}\n\n"
            f"History: {chat_history}\n\n"
            f"Retrieved Context:\n{context}\n\n"
            f"User Query: {user_query}"
        )

        # Append strict JSON output instruction so the main AI replies using
        # the agreed schema. The LLM should output RAW JSON only.
        json_instruction = (
            "\n\nAfter producing the assistant reply, RETURN EXACTLY this JSON schema (RAW JSON ONLY):\n"
            "{ \"response\": string, \"action\": \"show_ticket\" | \"show_resolve\" | \"none\", \"resolution_message\": string | null }\n"
            "- `response`: the assistant text shown to the user.\n"
            "- `action`: determines UI behavior.\n"
            "- `resolution_message`: optional short Taglish message for the UI, or null.\n"
            "DO NOT output any extra text, explanation, or markdown fences."
        )

        final_prompt = f"{final_prompt}{json_instruction}"

        llm = create_llm(model=model, temperature=temperature)
        result = await invoke_llm(
            llm,
            final_prompt,
            model=model,
            action="answer_generation",
        )
        return result.content
