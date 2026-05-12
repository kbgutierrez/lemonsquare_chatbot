"""
External user authentication service.

Calls the Lemon Square BizPortal API to resolve an auth token into
a user profile dict.

SECURITY CHANGES vs original:
  1. Test-user bypass is now gated behind ALLOW_TEST_AUTH=true in .env.
     The original code had the bypass unconditionally active, meaning it
     would work in production if someone sent a TEST_USER_* token.
  2. Raises domain exceptions (AuthenticationError, ExternalServiceError)
     instead of directly raising HTTPException — services should not know
     about HTTP; that mapping belongs in the exception handler.
"""

import logging

import httpx

from app.core.config import settings
from app.core.exceptions import AuthenticationError, ExternalServiceError

logger = logging.getLogger(__name__)


async def fetch_user_details(auth_token: str) -> dict:
    """
    Resolve an auth token to a user details dict.

    Returns a dict with at minimum: id, firstname, lastname.
    Raises AuthenticationError on invalid/expired token.
    Raises ExternalServiceError if BizPortal is unreachable.
    """

    # ── Test-user bypass (local dev only) ────────────────────────────────
    if settings.ALLOW_TEST_AUTH and auth_token.startswith("TEST_USER_"):
        try:
            user_id = int(auth_token.split("_")[-1])
        except ValueError:
            raise AuthenticationError("Malformed test token.")
        logger.debug("Test-auth bypass: simulating User #%d", user_id)
        return {
            "id": user_id,
            "firstname": "Local",
            "lastname": f"Tester {user_id}",
        }

    # ── Real BizPortal authentication ────────────────────────────────────
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                settings.BIZPORTAL_API_URL,
                headers=headers,
                timeout=settings.BIZPORTAL_TIMEOUT,
            )

            if response.status_code in (401, 403):
                raise AuthenticationError("Invalid or expired user token.")

            response.raise_for_status()
            return response.json()

        except httpx.RequestError as exc:
            logger.error("BizPortal unreachable: %s", exc)
            raise ExternalServiceError(
                "User authentication service is temporarily unavailable."
            )
