"""
External user authentication service — REFACTORED.
Uses BizPortalClient for HTTP calls and centralized JSON parsing.
"""
import logging
import time
import asyncio
from collections import OrderedDict
import httpx
from app.core.config import settings
from app.core.exceptions import AuthenticationError, ExternalServiceError
from app.services.external.bizportal_client import BizPortalClient

logger = logging.getLogger(__name__)

_TOKEN_CACHE_TTL_SECONDS = 60.0
_TOKEN_CACHE_MAX_SIZE = 2048
_token_cache: OrderedDict[str, tuple[dict, float]] = OrderedDict()
_token_cache_lock = asyncio.Lock()


def _cache_user(auth_token: str, user_data: dict, expires_at: float) -> None:
    _token_cache[auth_token] = (dict(user_data), expires_at)
    _token_cache.move_to_end(auth_token)
    while len(_token_cache) > _TOKEN_CACHE_MAX_SIZE:
        _token_cache.popitem(last=False)


async def fetch_user_details(auth_token: str) -> dict:
    """
    Resolve an auth token to a user details dict.
    Raises AuthenticationError or ExternalServiceError.
    """
    if not auth_token:
        raise AuthenticationError("Missing authentication token.")

    auth_token = str(auth_token).strip()

    # ── TEST USER BYPASS (LOCAL DEV ONLY) ──────────────────────
    if (
        getattr(settings, "ALLOW_TEST_AUTH", False)
        and (auth_token.startswith("TEST_USER_") or auth_token.startswith("TEST_ADMIN_"))
    ):
        try:
            user_id = int(auth_token.split("_")[-1])
        except ValueError:
            raise AuthenticationError("Malformed test token.")
        logger.debug("Test-auth bypass enabled for user #%d", user_id)
        is_admin = auth_token.startswith("TEST_ADMIN_")
        return {
            "id": user_id,
            "firstname": "Local",
            "lastname": f"Tester {user_id}",
            "email": "",
            "department": "Development",
            "department_acro": "DEV",
            "company": "1",
            "role": "admin" if is_admin else "user",
            "is_admin": is_admin,
        }

    # ── BIZPORTAL AUTH REQUEST ─────────────────────────────────
    try:
        now = time.time()
        async with _token_cache_lock:
            cached = _token_cache.get(auth_token)
            if cached and cached[1] > now:
                _token_cache.move_to_end(auth_token)
                logger.debug("BizPortal user cache hit token_len=%d", len(auth_token))
                return dict(cached[0])

        started = time.perf_counter()
        response = await BizPortalClient.fetch_user_details(auth_token)
        logger.info(
            "auth.bizportal_latency_ms=%d status_code=%s",
            int((time.perf_counter() - started) * 1000),
            response.status_code,
        )

        if response.status_code in (401, 403):
            logger.warning("BizPortal rejected token.")
            raise AuthenticationError("Invalid or expired user token.")

        response.raise_for_status()

        try:
            user_data = response.json()
        except Exception:
            logger.error("BizPortal returned invalid JSON: %s", response.text[:500])
            raise ExternalServiceError("Authentication service returned invalid response.")

        logger.info("BizPortal raw response: %s", user_data)

        # ── STRUCTURED ERROR RESPONSE ──────────────────────────
        if isinstance(user_data, dict) and user_data.get("status") == "error":
            error_msg = user_data.get("response", "Unknown authentication error")
            logger.warning("BizPortal error response: %s", error_msg)
            raise AuthenticationError(str(error_msg))

        # ── SUCCESS RESPONSE ───────────────────────────────────
        if (
            isinstance(user_data, dict)
            and user_data.get("status") == "success"
            and "response" in user_data
            and isinstance(user_data["response"], dict)
        ):
            logger.info("BizPortal authentication successful.")
            resolved_user = user_data["response"]
            async with _token_cache_lock:
                _cache_user(auth_token, resolved_user, now + _TOKEN_CACHE_TTL_SECONDS)
            return resolved_user

        # ── FALLBACK DIRECT USER OBJECT ────────────────────────
        if isinstance(user_data, dict) and ("firstname" in user_data or "lastname" in user_data or "id" in user_data):
            logger.info("Detected direct user object response.")
            async with _token_cache_lock:
                _cache_user(auth_token, user_data, now + _TOKEN_CACHE_TTL_SECONDS)
            return user_data

        # ── UNKNOWN RESPONSE FORMAT ────────────────────────────
        logger.error("Unexpected BizPortal response structure: %s", user_data)
        raise AuthenticationError("User details not found in API response.")

    except httpx.RequestError as exc:
        logger.error("BizPortal unreachable: %s", exc, exc_info=True)
        raise ExternalServiceError("User authentication service is temporarily unavailable.")
    except httpx.HTTPStatusError as exc:
        logger.error("BizPortal HTTP error: %s", exc, exc_info=True)
        raise ExternalServiceError("User authentication service returned an error.")
