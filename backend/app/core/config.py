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
    BIZPORTAL_TIMEOUT: float = 5.0

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
