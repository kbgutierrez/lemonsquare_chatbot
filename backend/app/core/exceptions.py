"""
Custom exception hierarchy and FastAPI exception handlers.

WHY this matters:
  Previously, errors surfaced as raw 500 responses with internal Python
  exception messages potentially leaking to clients, or as inconsistent
  HTTPException calls scattered across service and route layers.

  A central exception module provides:
  - Consistent JSON error response shape across all endpoints.
  - A clear separation: services raise domain exceptions; routes don't need
    to know what HTTP status to map them to.
  - One place to add logging, Sentry capture, or alerting for all errors.
"""

import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


# ─── Domain Exception Hierarchy ───────────────────────────────────────────────

class AppException(Exception):
    """Base class for all application-specific exceptions."""
    status_code: int = 500
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class NotFoundError(AppException):
    """Raised when a requested resource does not exist."""
    status_code = 404
    detail = "Resource not found."


class AuthenticationError(AppException):
    """Raised when a user token is invalid or expired."""
    status_code = 401
    detail = "Authentication failed."


class AuthorizationError(AppException):
    """Raised when an authenticated user lacks permission for an action."""
    status_code = 403
    detail = "You do not have permission to perform this action."


class ValidationError(AppException):
    """Raised when input data fails business-rule validation (beyond Pydantic)."""
    status_code = 422
    detail = "Invalid input."


class ExternalServiceError(AppException):
    """Raised when a downstream service (BizPortal, Groq, Qdrant) is unavailable."""
    status_code = 503
    detail = "An upstream service is temporarily unavailable."


class VectorStoreError(AppException):
    """Raised on Qdrant operation failures."""
    status_code = 500
    detail = "Vector store operation failed."


class AIProcessingError(AppException):
    """Raised when the AI pipeline fails to produce a response."""
    status_code = 500
    detail = "The AI processing pipeline encountered an error."


# ─── Handler Registration ──────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all exception handlers on the FastAPI application instance.
    Call this from main.py during app creation.
    """

    @app.exception_handler(AppException)
    async def app_exception_handler(
        request: Request, exc: AppException
    ) -> JSONResponse:
        # Log server-side errors at ERROR level; client errors at WARNING.
        if exc.status_code >= 500:
            logger.error(
                "Server error on %s %s: %s",
                request.method,
                request.url.path,
                exc.detail,
                exc_info=exc,
            )
        else:
            logger.warning(
                "Client error on %s %s: %s",
                request.method,
                request.url.path,
                exc.detail,
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.critical(
            "Unhandled exception on %s %s",
            request.method,
            request.url.path,
            exc_info=exc,
        )
        return JSONResponse(
            status_code=500,
            content={"error": "An internal server error occurred."},
        )
