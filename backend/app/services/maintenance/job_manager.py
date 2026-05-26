import uuid
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class JobStatus(BaseModel):
    job_id: str
    job_name: str
    status: str # "queued", "running", "completed", "failed"
    progress_percent: float = 0.0
    message: str = ""
    started_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    details: Dict[str, Any] = {}

class JobManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(JobManager, cls).__new__(cls)
            cls._instance._jobs = {}
            cls._instance._lock = threading.RLock()
            cls._instance._max_age = timedelta(hours=1)
        return cls._instance

    def _evict_old_jobs_locked(self) -> None:
        cutoff = datetime.utcnow() - self._max_age
        self._jobs = {
            job_id: job
            for job_id, job in self._jobs.items()
            if job.updated_at >= cutoff or job.status == "running"
        }

    def create_job(self, name: str) -> str:
        job_id = str(uuid.uuid4())
        job = JobStatus(
            job_id=job_id,
            job_name=name,
            status="queued",
            started_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        with self._lock:
            self._evict_old_jobs_locked()
            self._jobs[job_id] = job
        return job_id

    def update_job(self, job_id: str, status: str = None, progress: float = None, message: str = None, details: Dict[str, Any] = None, error: str = None):
        with self._lock:
            if job_id not in self._jobs:
                return

            job = self._jobs[job_id]
            if status:
                job.status = status
                if status in ["completed", "failed"]:
                    job.completed_at = datetime.utcnow()
                    job.progress_percent = 100.0 if status == "completed" else job.progress_percent

            if progress is not None:
                job.progress_percent = min(100.0, max(0.0, progress))

            if message:
                job.message = message

            if details:
                job.details.update(details)

            if error:
                job.error = error

            job.updated_at = datetime.utcnow()
            logger.debug("Job %s (%s) update: %s - %.1f%% - %s", job_id, job.job_name, job.status, job.progress_percent, job.message)

    def get_job(self, job_id: str) -> Optional[JobStatus]:
        with self._lock:
            self._evict_old_jobs_locked()
            return self._jobs.get(job_id)

    def get_all_jobs(self, limit: int = 20) -> list[JobStatus]:
        # Return sorted by updated_at desc
        with self._lock:
            self._evict_old_jobs_locked()
            all_jobs = list(self._jobs.values())
        all_jobs.sort(key=lambda x: x.updated_at, reverse=True)
        return all_jobs[:limit]

job_manager = JobManager()
