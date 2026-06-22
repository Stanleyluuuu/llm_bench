"""Unit tests for llm_benchmark.service.router._job_store."""

from __future__ import annotations

import threading

from llm_benchmark.service.router._job_store import create_job, get_job, update_job


def test_create_job_returns_unique_ids():
    id1 = create_job()
    id2 = create_job()
    assert id1 != id2
    assert len(id1) == 36  # UUID4 with hyphens


def test_new_job_status_is_pending():
    job_id = create_job()
    job = get_job(job_id)
    assert job is not None
    assert job["status"] == "pending"
    assert job["result"] is None
    assert job["error"] is None
    assert "created_at" in job


def test_update_job_changes_status():
    job_id = create_job()
    update_job(job_id, status="running")
    assert get_job(job_id)["status"] == "running"

    update_job(job_id, status="done", result={"success": True})
    job = get_job(job_id)
    assert job["status"] == "done"
    assert job["result"] == {"success": True}


def test_update_job_unknown_id_is_noop():
    """Updating a non-existent job must not raise."""
    update_job("nonexistent-id", status="done")  # should not raise


def test_get_job_unknown_returns_none():
    assert get_job("does-not-exist") is None


def test_get_job_returns_copy():
    """Mutating the returned dict must not affect the store."""
    job_id = create_job()
    copy1 = get_job(job_id)
    copy1["status"] = "MUTATED"
    copy2 = get_job(job_id)
    assert copy2["status"] == "pending"


def test_concurrent_creates_are_thread_safe():
    """Many threads creating jobs concurrently must each get a unique ID."""
    ids: list[str] = []
    lock = threading.Lock()

    def _create():
        jid = create_job()
        with lock:
            ids.append(jid)

    threads = [threading.Thread(target=_create) for _ in range(50)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(ids) == 50
    assert len(set(ids)) == 50, "Duplicate job IDs detected"
