import asyncio
import logging
from sqlalchemy.orm import Session
from app.core.database import SessionChatbot
from sqlalchemy import func

try:
    from app.models.chatbot import LLMUsageLog
except ImportError:  # pragma: no cover - schema is optional in current deployments
    LLMUsageLog = None

logger = logging.getLogger(__name__)

class TelemetryRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_usage(self, log_entry: dict):
        if LLMUsageLog is None:
            logger.debug("LLM telemetry model is not configured; dropping telemetry entry.")
            return
        try:
            entry = LLMUsageLog(**log_entry)
            self.db.add(entry)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to save LLM usage log: {e}")

    def get_model_summary(self, hours: int = 24):
        """Aggregate LLM usage stats grouped by model name."""
        if LLMUsageLog is None:
            return []
        from datetime import datetime, timedelta
        since = datetime.utcnow() - timedelta(hours=hours)

        results = self.db.query(
            LLMUsageLog.ModelName,
            func.count(LLMUsageLog.LogID).label("total_requests"),
            func.avg(LLMUsageLog.LatencyMs).label("avg_latency"),
            func.sum(LLMUsageLog.TokensPrompt).label("sum_prompt"),
            func.sum(LLMUsageLog.TokensCompletion).label("sum_completion"),
            func.sum(LLMUsageLog.TokensTotal).label("sum_total"),
            func.sum(func.case((LLMUsageLog.StatusCode == 429, 1), else_=0)).label("count_429"),
            func.sum(func.case((LLMUsageLog.StatusCode >= 500, 1), else_=0)).label("count_errors")
        ).filter(LLMUsageLog.Timestamp >= since)\
         .group_by(LLMUsageLog.ModelName).all()

        return results

    def get_recent_logs(self, limit: int = 50):
        """Fetch the most recent LLM logs."""
        if LLMUsageLog is None:
            return []
        return self.db.query(LLMUsageLog).order_by(LLMUsageLog.Timestamp.desc()).limit(limit).all()

class TelemetryService:
    _queue: asyncio.Queue = asyncio.Queue()
    _worker_task = None

    @classmethod
    def start_worker(cls):
        if cls._worker_task is None:
            cls._worker_task = asyncio.create_task(cls._process_queue())
            logger.info("Telemetry background worker started.")

    @classmethod
    async def _process_queue(cls):
        while True:
            try:
                log_entry = await cls._queue.get()
                # Run DB interaction in a thread to avoid blocking the event loop
                await asyncio.to_thread(cls._save_to_db, log_entry)
                cls._queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry worker: {e}")

    @classmethod
    def _save_to_db(cls, log_entry: dict):
        db = SessionChatbot()
        try:
            repo = TelemetryRepository(db)
            repo.log_usage(log_entry)
        finally:
            db.close()

    @classmethod
    def log(cls, model: str, action: str, prompt_tokens: int, completion_tokens: int, latency_ms: int, status_code: int = 200, session_id: str = None):
        """Asynchronously queue a telemetry log entry."""
        log_entry = {
            "ModelName": model,
            "Action": action,
            "TokensPrompt": prompt_tokens,
            "TokensCompletion": completion_tokens,
            "TokensTotal": prompt_tokens + completion_tokens,
            "LatencyMs": latency_ms,
            "StatusCode": status_code,
            "SessionID": session_id,
        }
        try:
            cls._queue.put_nowait(log_entry)
        except Exception as e:
            logger.error(f"Failed to queue telemetry log: {e}")

telemetry_service = TelemetryService()
