from pydantic import BaseModel
from typing import Optional

class GroqModelResponse(BaseModel):
    id: str
    name: str
    owned_by: Optional[str] = None
    created: Optional[int] = None
    context_window: Optional[int] = None
