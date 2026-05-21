"""
HTTP utilities for external API calls.
Extracted from admin_auth.py and user_service.py to eliminate duplication.
"""
import logging

logger = logging.getLogger(__name__)


def safe_json(response, context: str = "External API") -> dict:
    """
    Safely extract JSON from an HTTP response object.
    Handles empty responses and non-JSON content gracefully.

    Args:
        response: An httpx.Response-like object with .text and .json() methods.
        context: Context label for error logging.

    Returns:
        Parsed JSON dict, or error dict on failure.
    """
    try:
        if not response.text:
            return {}
        return response.json()
    except Exception:
        logger.error("%s returned non-JSON response", context)
        logger.error("RAW RESPONSE: %s", response.text[:2000])
        return {
            "status": "error",
            "message": "Invalid JSON response",
            "raw_response": response.text[:2000],
        }
