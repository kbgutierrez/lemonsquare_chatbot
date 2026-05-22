"""
FastAPI application factory (PRODUCTION SAFE VERSION)
Fixes:
- consistent routing
- removes double-prefix confusion
- cleaner API structure
- prevents full backend shutdown on AI/Qdrant failure
- keeps auth + health routes alive during partial failures
"""
import logging
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient

try:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
except ImportError:  # pragma: no cover
    _rate_limit_exceeded_handler = None
    RateLimitExceeded = None

from app.core.rate_limit import limiter

from app.api.routers import (
    auth,
    analytics,
    chat,
    documents,
    settings,
    tickets,
    explorer,
    self_knowledge,
    maintenance,
    routing,
    admin_auth,
)
from app.core.config import settings as app_settings
from app.core.database import SessionChatbot
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.services.ingestion.ingestion_service import DocumentIngestionService
from app.services.rag.support_orchestrator import SupportOrchestrator
from app.services.retrieval.vector_store import get_shared_vector_store

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up --- running pre-flight checks...")

    # Default safe app state
    app.state.ai_available = False
    app.state.orchestrator = None
    app.state.ingestion_service = None

    # Qdrant check
    try:
        logger.info("Starting Qdrant client and collection check...")
        qdrant_client = QdrantClient(
            url=app_settings.QDRANT_URL,
            api_key=app_settings.QDRANT_API_KEY,
            timeout=app_settings.QDRANT_TIMEOUT,
        )
        logger.info("Qdrant client created, checking collection %s", app_settings.QDRANT_COLLECTION)
        if not qdrant_client.collection_exists(app_settings.QDRANT_COLLECTION):
            logger.error("Qdrant collection missing: %s", app_settings.QDRANT_COLLECTION)
        else:
            logger.info("Qdrant OK - collection exists")
            logger.info("Preparing shared Qdrant vector store...")
            get_shared_vector_store().prepare_collection()
            logger.info("Shared Qdrant vector store ready")
    except Exception as exc:
        logger.error("Qdrant connection failed: %s", exc, exc_info=True)

    # AI Service Initialization
    db = SessionChatbot()
    try:
        logger.info("Starting AI service initialization...")
        logger.info("Creating SupportOrchestrator...")
        app.state.orchestrator = SupportOrchestrator(db=db)
        logger.info("SupportOrchestrator initialized")
        logger.info("Creating DocumentIngestionService...")
        app.state.ingestion_service = DocumentIngestionService(db=db)
        logger.info("DocumentIngestionService initialized")
        app.state.ai_available = True
        logger.info("AI services loaded successfully")
    except Exception as exc:
        logger.error("AI initialization failed: %s", exc, exc_info=True)
        app.state.ai_available = False
    finally:
        db.close()

    logger.info("Startup complete")
    yield
    logger.info("Shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="IT Support AI",
        version="2.0.0",
        lifespan=lifespan,
    )
    
    app.state.limiter = limiter
    if _rate_limit_exceeded_handler and RateLimitExceeded:
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    # Routes
    app.include_router(chat.router, prefix="/api")
    app.include_router(documents.router, prefix="/api")
    app.include_router(tickets.router, prefix="/api")
    app.include_router(settings.router, prefix="/api")
    app.include_router(explorer.router, prefix="/api")
    app.include_router(analytics.router, prefix="/api")
    app.include_router(maintenance.router, prefix="/api")
    app.include_router(routing.router, prefix="/api")
    app.include_router(auth.router, prefix="/api")
    app.include_router(admin_auth.router, prefix="/api")
    app.include_router(self_knowledge.router, prefix="/api")

    # Health
    @app.get("/health")
    def health():
        return {
            "status": "ok",
            "ai_available": app.state.ai_available,
        }

    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
