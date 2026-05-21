"""
BizPortal HTTP client.
Centralizes all external API calls to Lemon Square BizPortal.
Previously duplicated between user_service.py and admin_auth.py.
"""
import logging
import httpx
from app.core.config import settings
from app.utils.http_utils import safe_json

logger = logging.getLogger(__name__)

BIZPORTAL_USER_URL = settings.BIZPORTAL_API_URL
BIZPORTAL_LOGIN_URL = settings.BIZPORTAL_LOGIN_URL


class BizPortalClient:
    """HTTP client for BizPortal API calls."""

    @staticmethod
    async def fetch_user_details(auth_token: str) -> dict:
        """
        Fetch user details from BizPortal by auth token.
        Returns raw response dict.
        """
        headers = {"Accept": "application/json"}
        params = {"user_id": auth_token, "token": auth_token}

        logger.debug("BizPortal auth call to: %s", BIZPORTAL_USER_URL)
        logger.debug("Auth params: %s", params)

        async with httpx.AsyncClient(
            timeout=getattr(settings, "BIZPORTAL_TIMEOUT", 5.0)
        ) as client:
            response = await client.get(
                BIZPORTAL_USER_URL,
                headers=headers,
                params=params,
            )
            logger.debug("BizPortal status: %d", response.status_code)
            logger.debug("BizPortal preview: %s", response.text[:500])
            return response

    @staticmethod
    async def admin_login(username: str, password: str):
        """
        Perform admin login against BizPortal.
        Returns the HTTP response object.
        """
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                BIZPORTAL_LOGIN_URL,
                json={"username": username, "password": password},
                headers={"Content-Type": "application/json"},
            )
            return response
