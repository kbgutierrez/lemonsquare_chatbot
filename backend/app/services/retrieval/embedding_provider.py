"""Shared embedding model provider."""
from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings

from app.core.config import settings


@lru_cache(maxsize=4)
def get_embedding_model(model_name: str | None = None) -> HuggingFaceEmbeddings:
    """Load each embedding model once per process."""
    return HuggingFaceEmbeddings(model_name=model_name or settings.EMBEDDING_MODEL)
