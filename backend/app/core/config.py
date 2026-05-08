from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    HELPDESK_DB_CONN: str
    CHATBOT_DB_CONN: str
    
    # --- NEW: Future-Proofing Embeddings ---
    # Put the model name here so both ingest.py and the agent always match
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-large"
    
    # Change the collection name! This forces Qdrant to make a fresh 
    # 1024-dimension database without breaking your old 384-dimension one.
    QDRANT_COLLECTION: str = "helpdesk_multilingual_v1"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()