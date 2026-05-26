import logging
import httpx
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models"

class GroqService:
    """Service to interact with the Groq API for model discovery."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Fetches the list of available models from Groq.
        Returns a list of simplified model objects.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    GROQ_MODELS_URL,
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                models = data.get("data", [])
                
                # Simplify and filter (optional: only return active/valid models)
                processed_models = []
                for m in models:
                    # Groq returns various types, we usually want the ones that are actual LLMs
                    # We'll just return the essential info for now.
                    processed_models.append({
                        "id": m.get("id"),
                        "name": m.get("id"), # Groq often uses the ID as the display name
                        "owned_by": m.get("owned_by"),
                        "created": m.get("created"),
                        "context_window": m.get("context_window"), # If available in payload
                    })
                
                # Sort by ID for consistent display
                processed_models.sort(key=lambda x: x["id"])
                
                return processed_models

            except httpx.HTTPStatusError as exc:
                logger.error(f"Groq API error: {exc.response.status_code} - {exc.response.text}")
                return []
            except Exception as exc:
                logger.error(f"Unexpected error fetching Groq models: {exc}")
                return []
