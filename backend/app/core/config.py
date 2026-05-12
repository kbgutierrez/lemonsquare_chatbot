"""
Application configuration via pydantic-settings.

All values are sourced from environment variables or a .env file.
Defaults are provided for optional tuning parameters.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # ─── External Services ────────────────────────────────────────────────
    GROQ_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str

    # ─── Database Connections ─────────────────────────────────────────────
    HELPDESK_DB_CONN: str
    CHATBOT_DB_CONN: str

    # ─── Qdrant ───────────────────────────────────────────────────────────
    QDRANT_COLLECTION: str = "helpdesk_multilingual_v1"

    # ─── Default ML Model Names (overridden by DB settings at runtime) ────
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-large"
    RERANKER_MODEL: str = "BAAI/bge-reranker-v2-m3"
    CLASSIFIER_MODEL: str = "llama-3.1-8b-instant"

    # ─── Application ──────────────────────────────────────────────────────
    # Set ALLOW_TEST_AUTH=true in .env for local development only.
    # NEVER enable in production.
    ALLOW_TEST_AUTH: bool = False
    CORS_ORIGINS: list[str] = Field(default=["http://localhost:8501"])

    # ─── BizPortal ────────────────────────────────────────────────────────
    BIZPORTAL_API_URL: str = (
        "http://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/user/details"
    )
    BIZPORTAL_TIMEOUT: float = 5.0

    class Config:
        env_file = ".env"
        extra = "ignore"


# Module-level singleton; safe because Settings reads env vars, no I/O.
settings = Settings()
