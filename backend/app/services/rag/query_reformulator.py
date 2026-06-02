"""
Query reformulation service.
Rewrites vague user queries into specific IT search queries.
Extracted from SupportOrchestrator._run_pipeline().
"""
import logging
import json
from app.services.llm_client import create_llm, invoke_llm
from app.services.prompts import DEFAULT_REFORMULATOR_PROMPT
from app.utils.json_utils import safe_json_loads, clean_llm_json_output

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
        Supports single string output or JSON array of query variations.

        Args:
            user_query: The raw user message.
            chat_history: Recent conversation history text.
            model: The LLM model name for reformulation.
            prompt_template: Custom prompt template (uses default if None).

        Returns:
            The reformulated search query string (merged if multiple variations).
        """
        template = prompt_template or DEFAULT_REFORMULATOR_PROMPT
        safe_history = chat_history.strip() or "None"

        llm = create_llm(model=model, temperature=0.0)
        
        # Self-healing prompt formatting: handles {user_query}, {latest_message}, and {input}
        # to ensure compatibility with various DB-stored or legacy templates.
        try:
            rewrite_prompt = template.format(
                chat_history=safe_history,
                user_query=user_query,
                latest_message=user_query,
                input=user_query,
            )
        except KeyError as exc:
            logger.error("Reformulator prompt template error: missing key %s", exc)
            return user_query

        result = await invoke_llm(
            llm,
            rewrite_prompt,
            model=model,
            action="query_reformulation",
        )
        
        raw_output = result.content.strip()
        
        # Robust parsing using centralized utilities
        parsed = safe_json_loads(raw_output, context="query_reformulation")
        
        if isinstance(parsed, list):
            # Join variations with spaces to create a broad semantic search string
            # while maintaining the original signal.
            candidates = [str(item).strip() for item in parsed if str(item).strip()]
            if candidates:
                return " ".join(candidates)
        
        if isinstance(parsed, str) and parsed.strip():
            return parsed.strip()
            
        # Fallback to cleaned text if not valid JSON
        cleaned = raw_output.strip(' "\'\n')
        if cleaned.startswith("```"):
             cleaned = clean_llm_json_output(raw_output)
             
        return cleaned or user_query
