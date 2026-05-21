"""
FastAPI dependency providers.

All injectable dependencies are declared here. Routes import from this
module — they never instantiate services or sessions directly.

WHY centralise deps here:
  When dependencies are scattered (some in routes, some in services, some
  inline), it becomes hard to swap implementations for testing. Having one
  module for all providers means a test can override just these functions
  and get clean isolation everywhere.
"""

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_chatbot_db, get_helpdesk_db  # re-export
from app.services.ingestion_service import DocumentIngestionService
from app.services.orchestrator import SupportOrchestrator


def get_orchestrator(request: Request) -> SupportOrchestrator:
    """
    Retrieve the SupportOrchestrator from app.state.

    The orchestrator is created once during lifespan startup and stored
    on app.state. This dependency provides it to any route that needs it
    without re-instantiating the expensive ML models per request.
    """
    return request.app.state.orchestrator


def get_ingestion_service(request: Request) -> DocumentIngestionService:
    """
    Retrieve the DocumentIngestionService from app.state.

    Same pattern as get_orchestrator — the embedding model is loaded once.
    """
    return request.app.state.ingestion_service


# Re-export DB dependencies so routes only need to import from deps.
__all__ = [
    "get_chatbot_db",
    "get_helpdesk_db",
    "get_orchestrator",
    "get_ingestion_service",
]
