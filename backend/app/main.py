"""
FastAPI application factory.

This file's ONLY responsibilities:
  1. Create the FastAPI application.
  2. Configure middleware.
  3. Register routers.
  4. Register exception handlers.
  5. Run startup / shutdown logic (lifespan).

There is zero business logic here.

Previously, main.py contained 200+ lines including all admin route
handlers (documents, tickets, settings) and inline ORM queries. That
violated the Single Responsibility Principle and made the entry point
the hardest file to navigate in the project.
"""

import logging
import sys
from contextlib import asynccontextmanager

import uvicorn
from app.api.routers import auth
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from app.api.routers import analytics  

from app.api.routers import chat, documents, settings, tickets, explorer
from app.core.config import settings as app_settings
from app.core.database import SessionChatbot
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.services.ingestion_service import DocumentIngestionService
from app.services.orchestrator import SupportOrchestrator
from app.api.routers import self_knowledge
from app.api.routers import maintenance, routing

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown logic.

    On startup:
      - Verify Qdrant is reachable and the required collection exists.
      - Load the SupportOrchestrator (downloads ML models if not cached).
      - Load the DocumentIngestionService (shares the same embedding model).

    Loading ML models in the lifespan:
      This is intentional. Models are expensive (~1-3 GB, 30-120 seconds to
      load). By loading them once here and storing them in app.state, every
      request reuses the same in-memory model rather than reloading per request.
      The app exits immediately if startup fails, providing a clear error.
    """
    logger.info("Starting up — running pre-flight checks...")

    # ── Qdrant health check ───────────────────────────────────────────────
    try:
        qdrant_client = QdrantClient(
            url=app_settings.QDRANT_URL,
            api_key=app_settings.QDRANT_API_KEY,
            timeout=app_settings.QDRANT_TIMEOUT,
        )
        if not qdrant_client.collection_exists(app_settings.QDRANT_COLLECTION):
            logger.critical(
                "FATAL: Qdrant collection '%s' does not exist. "
                "Run scripts/ingest_tickets.py first.",
                app_settings.QDRANT_COLLECTION,
            )
            sys.exit(1)
        logger.info("Qdrant OK — collection '%s' verified.", app_settings.QDRANT_COLLECTION)
    except Exception as exc:
        logger.critical("Qdrant connection failed: %s", exc)
        sys.exit(1)

    # ── Load ML services (expensive — done once here, not per-request) ────
    db = SessionChatbot()
    try:
        logger.info("Loading AI Orchestrator (embedding + reranker models)...")
        app.state.orchestrator = SupportOrchestrator(db=db)

        logger.info("Loading Document Ingestion Service (embedding model)...")
        app.state.ingestion_service = DocumentIngestionService(db=db)
    except Exception as exc:
        logger.critical("Failed to initialise AI services: %s", exc, exc_info=True)
        sys.exit(1)
    finally:
        db.close()

    logger.info("Application startup complete.")
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────
    logger.info("Application shutting down.")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title="IT Support AI",
        description="Enterprise IT helpdesk RAG chatbot API.",
        version="2.0.0",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    # Origins are configurable via CORS_ORIGINS in .env.
    # Defaults to localhost only — NOT open to all origins.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception Handlers ────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────────
    PREFIX = "/api"
    app.include_router(chat.router, prefix=PREFIX)
    app.include_router(documents.router, prefix=PREFIX)
    app.include_router(tickets.router, prefix=PREFIX)
    app.include_router(settings.router, prefix=PREFIX)
    app.include_router(explorer.router, prefix=PREFIX)
    app.include_router(self_knowledge.router, prefix="/api")
    app.include_router(auth.router, prefix=PREFIX)
    app.include_router(analytics.router, prefix=PREFIX)
    app.include_router(maintenance.router, prefix=PREFIX)
    app.include_router(routing.router, prefix=PREFIX) 

    # ── Health Check ──────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    def health_check():
        """Liveness probe endpoint."""
        return {"status": "ok"}

    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
