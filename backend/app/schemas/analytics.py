from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LLMModelStats(BaseModel):
    model_name: str
    total_requests: int
    avg_latency_ms: float
    total_tokens_prompt: int
    total_tokens_completion: int
    total_tokens_total: int
    rate_limit_count: int # Count of 429s
    error_count: int      # Count of 500s

class TelemetrySummaryResponse(BaseModel):
    start_time: datetime
    end_time: datetime
    stats_by_model: List[LLMModelStats]
    total_tokens_overall: int

class RecentLLMLog(BaseModel):
    timestamp: datetime
    model_name: str
    action: str
    latency_ms: int
    status_code: int
    tokens_total: int
    session_id: Optional[str] = None

class DetailedTelemetryResponse(BaseModel):
    summary: TelemetrySummaryResponse
    recent_logs: List[RecentLLMLog]
