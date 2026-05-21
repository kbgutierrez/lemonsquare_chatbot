"""
Centralized LLM client factory.
Eliminates scattered ChatGroq instantiations across services.
Ensures consistent timeout, API key, and model configuration.
"""
import logging
from langchain_groq import ChatGroq
from app.core.config import settings

logger = logging.getLogger(__name__)


def create_llm(
    model: str | None = None,
    temperature: float = 0.0,
) -> ChatGroq:
    """
    Create a ChatGroq LLM instance with project defaults.

    Args:
        model: Model name. Defaults to CLASSIFIER_MODEL from settings.
        temperature: Sampling temperature. Defaults to 0.0 (deterministic).

    Returns:
        Configured ChatGroq instance.
    """
    resolved_model = model or settings.CLASSIFIER_MODEL
    return ChatGroq(
        model=resolved_model,
        temperature=temperature,
        api_key=settings.GROQ_API_KEY,
    )


def create_main_llm(temperature: float | None = None) -> ChatGroq:
    """Create the main LLM for answer generation."""
    from app.core.database import SessionChatbot
    from app.repositories.settings_repository import SettingsRepository
    db = SessionChatbot()
    try:
        config = SettingsRepository(db).get_active_settings()
        temp = temperature if temperature is not None else (float(config.Temperature) if config and config.Temperature else 0.2)
        model = (config.ActiveModel if config and config.ActiveModel else None) or "llama-3.3-70b-versatile"
        return create_llm(model=model, temperature=temp)
    except Exception:
        return create_llm(model="llama-3.3-70b-versatile", temperature=temperature or 0.2)
    finally:
        db.close()
