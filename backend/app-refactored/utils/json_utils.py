"""
JSON parsing utilities.
Extracted from scattered inline try/except blocks across the codebase.
Centralizes safe JSON handling with consistent error logging.
"""
import json
import logging

logger = logging.getLogger(__name__)


def safe_json_loads(raw_text: str, context: str = "Unknown") -> dict | list:
    """
    Safely parse a JSON string. Returns empty dict on failure.

    Args:
        raw_text: The raw JSON string to parse.
        context: Description of where this JSON came from (for logging).

    Returns:
        Parsed JSON as dict/list, or empty dict on failure.
    """
    if not raw_text or not raw_text.strip():
        return {}
    try:
        # Strip markdown code fences if present
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:].strip()
        if text.startswith("```"):
            text = text[3:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()
        return json.loads(text)
    except json.JSONDecodeError as exc:
        logger.error(
            "JSON decode failed [%s]: %s. Raw: %s",
            context,
            exc,
            raw_text[:500],
        )
        return {}
    except Exception as exc:
        logger.error(
            "Unexpected JSON parse error [%s]: %s",
            context,
            exc,
        )
        return {}


def clean_llm_json_output(raw_output: str) -> str:
    """
    Remove markdown code fences from LLM JSON responses.

    Args:
        raw_output: Raw LLM output that may contain markdown.

    Returns:
        Cleaned string ready for JSON parsing.
    """
    text = raw_output.strip()
    if text.startswith("```json"):
        text = text[7:].strip()
    elif text.startswith("```"):
        text = text[3:].strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text
