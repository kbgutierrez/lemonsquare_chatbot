"""
Admin authentication router.
Uses BizPortalClient for external HTTP calls.
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.external.bizportal_client import BizPortalClient
from app.utils.http_utils import safe_json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin Auth"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", summary="Admin login via BizPortal")
async def admin_login(payload: AdminLoginRequest):
    username = payload.username.strip()
    password = payload.password.strip()
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    try:
        response = await BizPortalClient.admin_login(username, password)
        logger.info("BizPortal login status: %s", response.status_code)
        data = safe_json(response, context="BizPortal admin login")
        logger.info("BizPortal login response: %s", data)

        if response.status_code != 200:
            error_message = data.get("message") or data.get("error") or data.get("detail") or "Login failed"
            logger.warning("BizPortal HTTP auth failure: %s", error_message)
            raise HTTPException(status_code=response.status_code, detail=error_message)

        # Logical auth failure check
        if isinstance(data, dict):
            status = str(data.get("status", "")).lower()
            success = data.get("success")
            message = str(data.get("message", "")).lower()
            auth_failed = any([
                status == "error",
                success is False,
                "invalid" in message,
                "incorrect" in message,
                "unauthorized" in message,
                "failed" in message,
            ])
            if auth_failed:
                logger.warning("BizPortal rejected credentials.")
                raise HTTPException(
                    status_code=401,
                    detail=(data.get("message") or data.get("error") or "Invalid credentials"),
                )

        # Response structure validation
        possible_user = data.get("data") or data.get("response") or data
        if not isinstance(possible_user, dict):
            logger.warning("No valid user object returned.")
            raise HTTPException(status_code=401, detail="Authentication failed")

        return {
            "success": True,
            "message": "Login successful",
            "data": possible_user,
            "token": str(possible_user.get("id")),  # ADDED: the ID is the token
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Unexpected login error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
