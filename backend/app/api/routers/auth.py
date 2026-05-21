"""
User auth verification router.
Thin HTTP layer delegating to user_service.
"""
import logging
from fastapi import APIRouter
from app.services.external.user_service import fetch_user_details
from app.core.exceptions import AuthenticationError, ExternalServiceError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/verify", summary="Verify a user token and get details")
async def verify_user(user_token: str):
    try:
        user_data = await fetch_user_details(user_token)
        name = f"{user_data.get('firstname', '')} {user_data.get('lastname', '')}".strip()
        return {
            "is_valid": True,
            "user_id": user_data.get("id"),
            "name": name if name else "Unknown User",
            "email": user_data.get("email", ""),
            "department": user_data.get("department", "Unknown"),
            "department_acro": user_data.get("department_acro", ""),
            "company_id": user_data.get("company", "1"),
            "raw_data": user_data,
        }
    except AuthenticationError as exc:
        return {"is_valid": False, "error": str(exc)}
    except ExternalServiceError as exc:
        return {"is_valid": False, "error": str(exc)}
    except Exception as exc:
        logger.error("Unexpected auth error: %s", exc)
        return {"is_valid": False, "error": "Internal authentication error."}
