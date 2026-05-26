"""
Application configuration via pydantic-settings.
All values are sourced from environment variables or a .env file.
Defaults are provided for optional tuning parameters.
"""
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    GROQ_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    HELPDESK_DB_CONN: str
    CHATBOT_DB_CONN: str
    QDRANT_COLLECTION: str = "LemonSquareQdrant"
    QDRANT_ROUTING_COLLECTION: str = "LemonSquareRouting"
    QDRANT_TIMEOUT: float = 60.0
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-large"
    RERANKER_MODEL: str = "BAAI/bge-reranker-v2-m3"
    CLASSIFIER_MODEL: str = "llama-3.1-8b-instant"
    ALLOW_TEST_AUTH: bool = False
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = Field(default=["http://localhost:8501"])
    BIZPORTAL_API_URL: str = (
        "http://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/user/details"
    )
    BIZPORTAL_LOGIN_URL: str = (
        "https://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/admin/login"
    )
    BIZPORTAL_TICKET_URL: str = (
        "https://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/send/ticket/"
    )
    BIZPORTAL_TIMEOUT: float = 5.0
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 30
    DB_POOL_TIMEOUT: int = 10
    MAX_UPLOAD_MB: int = 25
    MAX_CONCURRENT_UPLOADS: int = 3
    TAXONOMY_CACHE_TTL_SECONDS: int = 1800

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
