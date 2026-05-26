"""Shared embedding model provider."""
from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings

from app.core.config import settings


@lru_cache(maxsize=4)
def _get_embedding_model(resolved_model_name: str) -> HuggingFaceEmbeddings:
    """Load each embedding model once per process."""
    return HuggingFaceEmbeddings(model_name=resolved_model_name)


def get_embedding_model(model_name: str | None = None) -> HuggingFaceEmbeddings:
    """Normalize cache keys so None and the default model share one instance."""
    return _get_embedding_model(model_name or settings.EMBEDDING_MODEL)
