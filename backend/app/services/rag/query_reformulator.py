"""
Query reformulation service.
Rewrites vague user queries into specific IT search queries.
Extracted from SupportOrchestrator._run_pipeline().
"""
import logging
from app.services.llm_client import create_llm
from app.services.prompts import DEFAULT_REFORMULATOR_PROMPT

logger = logging.getLogger(__name__)


class QueryReformulator:
    """Reformulates user queries for better vector retrieval."""

    async def reformulate(
        self,
        user_query: str,
        chat_history: str,
        model: str,
        prompt_template: str | None = None,
    ) -> str:
        """
        Rewrite a query using conversation context.

        Args:
            user_query: The raw user message.
            chat_history: Recent conversation history text.
            model: The LLM model name for reformulation.
            prompt_template: Custom prompt template (uses default if None).

        Returns:
            The reformulated search query string.
        """
        template = prompt_template or DEFAULT_REFORMULATOR_PROMPT
        safe_history = chat_history.strip() or "No previous history. This is the first message."

        llm = create_llm(model=model, temperature=0.0)
        rewrite_prompt = template.format(
            chat_history=safe_history,
            user_query=user_query,
        )
        result = await llm.ainvoke(rewrite_prompt)
        return result.content.strip(' "\'\n')
