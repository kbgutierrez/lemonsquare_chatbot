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

    Returns a dict with at minimum:
    - id
    - firstname
    - lastname

    Raises:
    - AuthenticationError
    - ExternalServiceError
    """

    # ========================================
    # INPUT VALIDATION
    # ========================================

    if not auth_token:
        raise AuthenticationError("Missing authentication token.")

    auth_token = str(auth_token).strip()

    # ========================================
    # TEST USER BYPASS (LOCAL DEV ONLY)
    # ========================================

    if (
        getattr(settings, "ALLOW_TEST_AUTH", False)
        and auth_token.startswith("TEST_USER_")
    ):
        try:
            user_id = int(auth_token.split("_")[-1])

        except ValueError:
            raise AuthenticationError(
                "Malformed test token."
            )

        logger.debug(
            "Test-auth bypass enabled for user #%d",
            user_id,
        )

        return {
            "id": user_id,
            "firstname": "Local",
            "lastname": f"Tester {user_id}",
            "email": "",
            "department": "Development",
            "department_acro": "DEV",
            "company": "1",
        }

    # ========================================
    # BIZPORTAL AUTH REQUEST
    # ========================================

    headers = {
        "Accept": "application/json",
    }

    # IMPORTANT:
    # Verify actual required parameter name.
    #
    # You changed this from:
    #   token/auth_token
    #
    # to:
    #   user_id
    #
    # This may be the REAL BREAKING CHANGE.
    #
    # If BizPortal actually expects:
    #   token
    #
    # auth will silently fail.
    #
    # Keeping BOTH for compatibility.
    params = {
        "user_id": auth_token,
        "token": auth_token,
    }

    logger.debug(
        "Attempting BizPortal auth call to: %s",
        settings.BIZPORTAL_API_URL,
    )

    logger.debug(
        "Auth params being sent: %s",
        params,
    )

    try:
        async with httpx.AsyncClient(
            timeout=getattr(
                settings,
                "BIZPORTAL_TIMEOUT",
                5.0,
            )
        ) as client:

            response = await client.get(
                settings.BIZPORTAL_API_URL,
                headers=headers,
                params=params,
            )

        logger.debug(
            "BizPortal response status: %d",
            response.status_code,
        )

        logger.debug(
            "BizPortal response preview: %s",
            response.text[:500],
        )

        # ========================================
        # AUTH FAILURES
        # ========================================

        if response.status_code in (401, 403):
            logger.warning(
                "BizPortal rejected token."
            )

            raise AuthenticationError(
                "Invalid or expired user token."
            )

        response.raise_for_status()

        # ========================================
        # SAFE JSON PARSING
        # ========================================

        try:
            user_data = response.json()

        except Exception:
            logger.error(
                "BizPortal returned invalid JSON: %s",
                response.text[:500],
            )

            raise ExternalServiceError(
                "Authentication service returned invalid response."
            )

        logger.info(
            "BizPortal raw response: %s",
            user_data,
        )

        # ========================================
        # STRUCTURED ERROR RESPONSE
        # ========================================

        if (
            isinstance(user_data, dict)
            and user_data.get("status") == "error"
        ):
            error_msg = user_data.get(
                "response",
                "Unknown authentication error",
            )

            logger.warning(
                "BizPortal returned error response: %s",
                error_msg,
            )

            raise AuthenticationError(str(error_msg))

        # ========================================
        # SUCCESS RESPONSE
        # ========================================

        if (
            isinstance(user_data, dict)
            and user_data.get("status") == "success"
            and "response" in user_data
            and isinstance(user_data["response"], dict)
        ):
            final_user_dict = user_data["response"]

            logger.info(
                "BizPortal authentication successful."
            )

            return final_user_dict

        # ========================================
        # FALLBACK DIRECT USER OBJECT
        # ========================================

        # Some APIs return the user object directly.
        if (
            isinstance(user_data, dict)
            and (
                "firstname" in user_data
                or "lastname" in user_data
                or "id" in user_data
            )
        ):
            logger.info(
                "Detected direct user object response."
            )

            return user_data

        # ========================================
        # UNKNOWN RESPONSE FORMAT
        # ========================================

        logger.error(
            "Unexpected BizPortal response structure: %s",
            user_data,
        )

        raise AuthenticationError(
            "User details not found in API response."
        )

    except httpx.RequestError as exc:
        logger.error(
            "BizPortal unreachable: %s",
            exc,
            exc_info=True,
        )

        raise ExternalServiceError(
            "User authentication service is temporarily unavailable."
        )

    except httpx.HTTPStatusError as exc:
        logger.error(
            "BizPortal HTTP error: %s",
            exc,
            exc_info=True,
        )

        raise ExternalServiceError(
            "User authentication service returned an error."
        )