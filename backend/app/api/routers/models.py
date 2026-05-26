from fastapi import APIRouter, Depends
from typing import List
from app.services.external.groq_service import GroqService
from app.api.deps import require_admin_user
from app.schemas.models import GroqModelResponse

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("/groq", response_model=List[GroqModelResponse])
async def get_groq_models(
    current_user: dict = Depends(require_admin_user)
) -> List[GroqModelResponse]:
    """
    Fetch available models from Groq API.
    Restricted to admin users as this is used for configuration.
    """
    service = GroqService()
    return await service.get_available_models()
