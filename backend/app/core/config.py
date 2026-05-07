from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    SQL_SERVER_CONN: str = "Driver={ODBC Driver 17 for SQL Server};Server=your-rds-url;Database=master;Uid=admin;Pwd=password;"

    class Config:
        env_file = ".env"

settings = Settings()