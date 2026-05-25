from pydantic import BaseModel, Field


class RoutingRequest(BaseModel):
    summary: str = Field(..., min_length=5)
    description: str = Field(..., min_length=10)


class RoutingSuggestion(BaseModel):
    department_id: int
    subcategory_id: int
    department_name: str | None = None
    subcategory_name: str | None = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    analysis: str | None = None


class RoutingResponse(BaseModel):
    status: str
    log_id: str
    suggestion: RoutingSuggestion
