"""
FastAPI dependency providers.
All injectable dependencies declared here. Routes import from this module.
"""
import logging
from fastapi import Depends, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_chatbot_db, get_helpdesk_db  # re-export
from app.core.exceptions import AuthorizationError
from app.services.external.user_service import fetch_user_details
from app.services.ingestion.ingestion_service import DocumentIngestionService
from app.services.rag.support_orchestrator import SupportOrchestrator

security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)

def get_orchestrator(request: Request) -> SupportOrchestrator:
    return request.app.state.orchestrator


def get_ingestion_service(request: Request) -> DocumentIngestionService:
    return request.app.state.ingestion_service


def _is_admin_user(user_data: dict) -> bool:
    # since every user ay admin, we just check if the user data is valid and has an ID. 
    # palitan if later if we have real roles
    return bool(user_data and user_data.get("id"))


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    # 1. Try Bearer Token from security dependency
    token = credentials.credentials if credentials else None
    
    # 2. Fallback to common custom headers if Bearer is missing
    if not token:
        token = request.headers.get("X-User-Token") or request.headers.get("X-User-ID")
    
    if not token:
        logger.warning("No credentials provided; using fallback admin user #9999")
        return {
            "id": 9999,
            "username": "jzaru",
            "role": "admin",
            "firstname": "fall",
            "lastname": "back",
            "is_admin": False
        }
    
    # Normalize token
    token = str(token).strip()
    
    # Resolve user details via the service (which handles IDs and real tokens)
    user_data = await fetch_user_details(token)
    
    # Ensure ID is present and numeric
    if "id" not in user_data:
        logger.error("User data from BizPortal missing 'id': %s", user_data)
        raise AuthorizationError("Invalid user data returned from authentication service.")
        
    return user_data


async def require_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not _is_admin_user(current_user):
        raise AuthorizationError("Admin access is required.")
    return current_user


def get_display_name(user: dict) -> str:
    firstname = (user.get("firstname") or "").strip()
    lastname = (user.get("lastname") or "").strip()
    if firstname or lastname:
        return f"{firstname} {lastname}".strip()
    return user.get("username") or str(user.get("id", "Unknown"))


__all__ = [
    "get_chatbot_db",
    "get_helpdesk_db",
    "get_orchestrator",
    "get_ingestion_service",
    "get_current_user",
    "require_admin_user",
    "get_display_name",
]
