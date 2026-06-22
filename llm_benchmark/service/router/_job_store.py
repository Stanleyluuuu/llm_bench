import threading
import uuid
from datetime import datetime
from typing import Any, Literal

JobStatus = Literal["pending", "running", "done", "error"]

_lock: threading.Lock = threading.Lock()
_jobs: dict[str, dict[str, Any]] = {}


def create_job() -> str:
    """Create a new job and return its ID."""
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {
            "status": "pending",
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "result": None,
            "error": None,
            "stage": None,
            "progress": None,
        }
        
    return job_id


def update_job(job_id: str, **kwargs: Any) -> None:
    """Update fields on an existing job (no-op if job_id unknown)."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id].update(kwargs)


def get_job(job_id: str) -> dict[str, Any] | None:
    """Return a shallow copy of the job dict, or *None* if not found."""
    with _lock:
        job = _jobs.get(job_id)

        return dict(job) if job is not None else None
