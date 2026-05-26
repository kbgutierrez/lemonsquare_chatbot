"""
JSON parsing utilities.
Extracted from scattered inline try/except blocks across the codebase.
Centralizes safe JSON handling with consistent error logging.
"""
import json
import logging
import re

logger = logging.getLogger(__name__)


def _find_matching_closing(text: str, start_index: int, opener: str, closer: str) -> int:
    depth = 0
    in_string = False
    escape = False

    for index in range(start_index, len(text)):
        char = text[index]

        if escape:
            escape = False
            continue

        if char == "\\":
            escape = True
            continue

        if char == '"':
            in_string = not in_string
            continue

        if in_string:
            continue

        if char == opener:
            depth += 1
        elif char == closer:
            depth -= 1
            if depth == 0:
                return index

    return -1


def _extract_json_snippet(raw_text: str) -> str:
    text = raw_text.strip()
    if not text:
        return ""

    # Prefer explicit JSON code fences
    fence_pattern = re.compile(
        r"```json\s*(.*?)\s*```|```(?:json\s*)?(.*?)\s*```",
        re.DOTALL | re.IGNORECASE,
    )
    matches = fence_pattern.findall(text)
    for json_block, generic_block in matches:
        snippet = json_block or generic_block
        if snippet and snippet.strip():
            return snippet.strip()

    # Fallback: extract the first top-level JSON object or array from mixed text.
    for opener, closer in (("{", "}"), ("[", "]")):
        start_index = text.find(opener)
        if start_index == -1:
            continue

        end_index = _find_matching_closing(text, start_index, opener, closer)
        if end_index != -1:
            snippet = text[start_index:end_index + 1].strip()
            if snippet:
                return snippet

    return text


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
        cleaned = _extract_json_snippet(raw_text)
        return json.loads(cleaned)
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
    Extract clean JSON text from raw LLM output.

    Args:
        raw_output: Raw LLM output that may contain markdown or surrounding text.

    Returns:
        The extracted JSON snippet ready for parsing.
    """
    return _extract_json_snippet(raw_output)
