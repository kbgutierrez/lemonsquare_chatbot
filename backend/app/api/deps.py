"""
FastAPI dependency providers.
All injectable dependencies declared here. Routes import from this module.
"""
from fastapi import Depends, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_chatbot_db, get_helpdesk_db  # re-export
from app.core.exceptions import AuthorizationError
from app.services.external.user_service import fetch_user_details
from app.services.ingestion.ingestion_service import DocumentIngestionService
from app.services.rag.support_orchestrator import SupportOrchestrator


def get_orchestrator(request: Request) -> SupportOrchestrator:
    return request.app.state.orchestrator


def get_ingestion_service(request: Request) -> DocumentIngestionService:
    return request.app.state.ingestion_service


def _is_admin_user(user_data: dict) -> bool:
    role_values = [
        user_data.get("role"),
        user_data.get("user_role"),
        user_data.get("user_type"),
        user_data.get("type"),
        user_data.get("is_admin"),
        user_data.get("admin"),
    ]
    return any(str(value).strip().lower() in {"admin", "administrator", "true", "1"} for value in role_values)


async def get_current_user(user_token: str = Query(..., min_length=1)) -> dict:
    return await fetch_user_details(user_token)


async def require_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not _is_admin_user(current_user):
        raise AuthorizationError("Admin access is required.")
    return current_user


__all__ = [
    "get_chatbot_db",
    "get_helpdesk_db",
    "get_orchestrator",
    "get_ingestion_service",
    "get_current_user",
    "require_admin_user",
]
