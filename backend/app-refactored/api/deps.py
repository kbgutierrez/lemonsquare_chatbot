"""
FastAPI dependency providers.
All injectable dependencies declared here. Routes import from this module.
"""
from fastapi import Request
from sqlalchemy.orm import Session
from app.core.database import get_chatbot_db, get_helpdesk_db  # re-export
from app.services.ingestion.ingestion_service import DocumentIngestionService
from app.services.rag.support_orchestrator import SupportOrchestrator


def get_orchestrator(request: Request) -> SupportOrchestrator:
    return request.app.state.orchestrator


def get_ingestion_service(request: Request) -> DocumentIngestionService:
    return request.app.state.ingestion_service


__all__ = [
    "get_chatbot_db",
    "get_helpdesk_db",
    "get_orchestrator",
    "get_ingestion_service",
]
