"""
Custom exception hierarchy and FastAPI exception handlers.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    status_code: int = 500
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class NotFoundError(AppException):
    status_code = 404
    detail = "Resource not found."


class AuthenticationError(AppException):
    status_code = 401
    detail = "Authentication failed."


class AuthorizationError(AppException):
    status_code = 403
    detail = "You do not have permission to perform this action."


class ValidationError(AppException):
    status_code = 422
    detail = "Invalid input."


class ExternalServiceError(AppException):
    status_code = 503
    detail = "An upstream service is temporarily unavailable."


class VectorStoreError(AppException):
    status_code = 500
    detail = "Vector store operation failed."


class AIProcessingError(AppException):
    status_code = 500
    detail = "The AI processing pipeline encountered an error."


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
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
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
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
