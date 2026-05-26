"""
Centralized LLM client factory.
Eliminates scattered ChatGroq instantiations across services.
Ensures consistent timeout, API key, and model configuration.
"""
import logging
import time
from functools import lru_cache
from typing import Any
from langchain_groq import ChatGroq
from app.core.config import settings
from app.services.telemetry_service import TelemetryService

logger = logging.getLogger(__name__)

_GROQ_TIMEOUT_SECONDS = 25.0
_GROQ_MAX_RETRIES = 3


@lru_cache(maxsize=16)
def _get_cached_llm(model: str, temperature_x100: int) -> ChatGroq:
    temperature = temperature_x100 / 100.0
    logger.info(
        "Creating cached Groq client model=%s temperature=%.2f timeout=%.1fs retries=%d",
        model,
        temperature,
        _GROQ_TIMEOUT_SECONDS,
        _GROQ_MAX_RETRIES,
    )
    return ChatGroq(
        model=model,
        temperature=temperature,
        api_key=settings.GROQ_API_KEY,
        timeout=_GROQ_TIMEOUT_SECONDS,
        max_retries=_GROQ_MAX_RETRIES,
    )


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
    temperature_x100 = int(round(float(temperature) * 100))
    return _get_cached_llm(resolved_model, temperature_x100)


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


async def invoke_llm(
    llm: ChatGroq,
    prompt: str,
    *,
    model: str,
    action: str,
    session_id: str | None = None,
) -> Any:
    """Invoke Groq with consistent latency/error logging and telemetry."""
    started = time.perf_counter()
    status_code = 200
    try:
        result = await llm.ainvoke(prompt)
        return result
    except Exception as exc:
        status_code = getattr(getattr(exc, "response", None), "status_code", 500)
        logger.warning(
            "groq.invoke_failed action=%s model=%s status_code=%s latency_ms=%d error=%s",
            action,
            model,
            status_code,
            int((time.perf_counter() - started) * 1000),
            exc,
        )
        raise
    finally:
        latency_ms = int((time.perf_counter() - started) * 1000)
        TelemetryService.log(
            model=model,
            action=action,
            prompt_tokens=0,
            completion_tokens=0,
            latency_ms=latency_ms,
            status_code=status_code,
            session_id=session_id,
        )
        logger.info(
            "groq.latency_ms=%d action=%s model=%s status_code=%s",
            latency_ms,
            action,
            model,
            status_code,
        )
