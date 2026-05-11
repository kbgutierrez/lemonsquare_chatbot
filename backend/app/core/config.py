from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    HELPDESK_DB_CONN: str
    CHATBOT_DB_CONN: str

    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-large"
    

    QDRANT_COLLECTION: str = "helpdesk_multilingual_v1"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()