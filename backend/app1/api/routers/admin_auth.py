import logging
import httpx

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/admin",
    tags=["Admin Auth"]
)

# ========================================
# REQUEST MODEL
# ========================================

class AdminLoginRequest(BaseModel):
    username: str
    password: str


# ========================================
# EXTERNAL API
# ========================================

BIZPORTAL_LOGIN_URL = (
    "https://lsbizportal.lemonsquare.com.ph/"
    "testportal/api/chatbot/admin/login"
)


# ========================================
# SAFE JSON PARSER
# ========================================

def safe_json(response: httpx.Response):
    try:
        if not response.text:
            return {}

        return response.json()

    except Exception:
        logger.error(
            "BizPortal returned non-JSON response"
        )

        logger.error(
            "RAW RESPONSE: %s",
            response.text,
        )

        return {
            "status": "error",
            "message": "Invalid JSON response",
            "raw_response": response.text,
        }


# ========================================
# LOGIN ROUTE
# ========================================

@router.post(
    "/login",
    summary="Admin login via BizPortal"
)
async def admin_login(
    payload: AdminLoginRequest
):

    # ========================================
    # VALIDATION
    # ========================================

    username = payload.username.strip()
    password = payload.password.strip()

    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail=(
                "Username and password required"
            ),
        )

    try:
        async with httpx.AsyncClient(
            timeout=30
        ) as client:

            response = await client.post(
                BIZPORTAL_LOGIN_URL,
                json={
                    "username": username,
                    "password": password,
                },
                headers={
                    "Content-Type":
                    "application/json"
                },
            )

        logger.info(
            "BizPortal login status: %s",
            response.status_code,
        )

        data = safe_json(response)

        logger.info(
            "BizPortal login response: %s",
            data,
        )

        # ========================================
        # HTTP FAILURE
        # ========================================

        if response.status_code != 200:

            error_message = (
                data.get("message")
                or data.get("error")
                or data.get("detail")
                or "Login failed"
            )

            logger.warning(
                "BizPortal HTTP auth failure: %s",
                error_message,
            )

            raise HTTPException(
                status_code=response.status_code,
                detail=error_message,
            )

        # ========================================
        # LOGICAL AUTH FAILURE
        # ========================================

        # IMPORTANT:
        # BizPortal may still return 200
        # even when credentials are invalid.
        #
        # We MUST validate response content.

        if isinstance(data, dict):

            status = str(
                data.get("status", "")
            ).lower()

            success = data.get("success")

            message = str(
                data.get("message", "")
            ).lower()

            # Common failure patterns
            auth_failed = any([
                status == "error",
                success is False,
                "invalid" in message,
                "incorrect" in message,
                "unauthorized" in message,
                "failed" in message,
            ])

            if auth_failed:

                logger.warning(
                    "BizPortal rejected credentials."
                )

                raise HTTPException(
                    status_code=401,
                    detail=(
                        data.get("message")
                        or data.get("error")
                        or "Invalid credentials"
                    ),
                )

        # ========================================
        # RESPONSE STRUCTURE VALIDATION
        # ========================================

        # IMPORTANT:
        # Ensure actual authenticated user exists

        possible_user = (
            data.get("data")
            or data.get("response")
            or data
        )

        if not isinstance(possible_user, dict):

            logger.warning(
                "No valid user object returned."
            )

            raise HTTPException(
                status_code=401,
                detail="Authentication failed",
            )

        # ========================================
        # SUCCESS
        # ========================================

        return {
            "success": True,
            "message": "Login successful",
            "data": possible_user,
        }

    except httpx.RequestError as exc:

        logger.error(
            "Connection error: %s",
            exc,
            exc_info=True,
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to connect to BizPortal"
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:

        logger.error(
            "Unexpected login error: %s",
            exc,
            exc_info=True,
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )