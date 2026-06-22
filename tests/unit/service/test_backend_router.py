"""Integration tests for the FastAPI backend router — evaluate job queue endpoints.

Uses httpx + FastAPI's TestClient so no real network calls are made.
``EvaluateService`` is fully patched.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from llm_benchmark.service.app import create_app


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(create_app())


# ─── GET /api/config ──────────────────────────────────────────────────────────


def test_get_config_has_no_api_base(client: TestClient):
    resp = client.get("/api/config")
    assert resp.status_code == 200
    data = resp.json()
    assert "schema_version" in data
    assert "builtins" in data
    builtins_by_id = {b["id"]: b for b in data["builtins"]}
    for key in ("llm_large", "llm_small", "vlm_large", "vlm_small"):
        assert key in builtins_by_id, f"{key} missing from builtins list"
        assert "api_base" not in builtins_by_id[key], f"{key} must not expose api_base"
    assert "name" in builtins_by_id["llm_large"]
    assert "name" in builtins_by_id["vlm_large"]
    assert "resize" in builtins_by_id["vlm_large"]


# ─── POST /api/evaluate (job queue) ──────────────────────────────────────────


def _make_fake_evaluation(*args, **kwargs):
    """Return a fake result that mimics Runner.evaluate() model-major shape."""
    models: list = kwargs.get("models", args[1] if len(args) > 1 else [])
    projects: list = kwargs.get("projects", args[0] if args else [])
    from llm_benchmark.schema import ModelRun, RunStatus

    fake_run = ModelRun(status=RunStatus.OK)
    # model-major: {model_id: {project: ModelRun}}
    model_ids = [m.id for m in models] if models else ["llm_large"]
    return {mid: dict.fromkeys(projects, fake_run) for mid in model_ids}


@patch("llm_benchmark.runner.Runner.evaluate", side_effect=_make_fake_evaluation)
def test_post_evaluate_returns_job_id(mock_eval, client: TestClient):
    resp = client.post(
        "/api/evaluate",
        json={"projects": ["Plate_Detection"]},
    )
    assert resp.status_code == 202
    body = resp.json()
    assert "job_id" in body
    assert isinstance(body["job_id"], str)
    assert len(body["job_id"]) == 36


@patch("llm_benchmark.runner.Runner.evaluate", side_effect=_make_fake_evaluation)
def test_evaluate_status_and_result_flow(mock_eval, client: TestClient):
    """Full happy-path: submit → status (pending/running) → result (done)."""
    import time

    # Submit
    resp = client.post("/api/evaluate", json={"projects": ["Plate_Detection"]})
    assert resp.status_code == 202
    job_id = resp.json()["job_id"]

    # Poll status until done (background thread runs in same process)
    deadline = time.time() + 10
    while time.time() < deadline:
        sr = client.get(f"/api/evaluate/status/{job_id}")
        assert sr.status_code == 200
        status = sr.json()["status"]
        if status in ("done", "error"):
            break
        time.sleep(0.1)
    else:
        pytest.fail("Job did not finish within 10 s")

    assert status == "done", f"Expected done, got {status}"

    # Fetch result
    rr = client.get(f"/api/evaluate/result/{job_id}")
    assert rr.status_code == 200
    result_body = rr.json()
    assert result_body["success"] is True
    # model-major: results is {model_id: {spec, projects: {project: run}}}
    assert isinstance(result_body["results"], dict)


def test_evaluate_status_unknown_job(client: TestClient):
    resp = client.get("/api/evaluate/status/nonexistent-job-id")
    assert resp.status_code == 404


def test_evaluate_result_unknown_job(client: TestClient):
    resp = client.get("/api/evaluate/result/nonexistent-job-id")
    assert resp.status_code == 404


# ─── FU-3: path traversal defenses ───────────────────────────────────────────


@pytest.mark.parametrize(
    "bad_project",
    [
        "../etc/passwd",
        "/etc/passwd",
        "..",
        "../ANPR",
        "ANPR/../../etc",
        "nonexistent-project",
        "",
        "foo\x00bar",
    ],
)
def test_post_evaluate_rejects_hostile_project_name(bad_project, client: TestClient):
    resp = client.post("/api/evaluate", json={"projects": [bad_project]})
    assert resp.status_code in (400, 422), (
        f"Expected 400/422 for {bad_project!r}, got {resp.status_code} body={resp.text}"
    )


@pytest.mark.parametrize(
    "bad_project",
    ["nonexistent-project"],
)
def test_get_history_rejects_hostile_project_name(bad_project, client: TestClient):
    # Note: httpx TestClient normalises literal `..` and decodes `%2F` before
    # dispatch, so those variants never reach the handler. The direct
    # `validate_project_name` unit test below covers raw-input rejection.
    resp = client.get(f"/api/history/{bad_project}")
    assert resp.status_code in (400, 404)


@pytest.mark.parametrize(
    "bad_filename",
    [
        "evaluation_..json",
        "notmatching.txt",
    ],
)
def test_get_history_detail_rejects_hostile_filename(bad_filename, client: TestClient):
    # httpx normalises `..` segments and decodes `%2F`; only pattern-violating
    # names that survive normalisation reach the filename validator here. Raw
    # traversal strings are covered by the direct validator unit test.
    resp = client.get(f"/api/history/ANPR/{bad_filename}")
    assert resp.status_code in (400, 404)


def test_validate_project_name_direct():
    from llm_benchmark.settings import validate_project_name

    with pytest.raises(ValueError):
        validate_project_name("../etc")
    with pytest.raises(ValueError):
        validate_project_name("/absolute")
    with pytest.raises(ValueError):
        validate_project_name("")
    with pytest.raises(ValueError):
        validate_project_name("definitely-not-a-project-xyz")
    # A real existing project should pass.
    assert validate_project_name("Plate_Detection") == "Plate_Detection"


def test_validate_history_filename_direct():
    from llm_benchmark.settings import validate_history_filename

    with pytest.raises(ValueError):
        validate_history_filename("../evil.json")
    with pytest.raises(ValueError):
        validate_history_filename("notmatching.txt")
    with pytest.raises(ValueError):
        validate_history_filename("evaluation_../etc.json")
    assert validate_history_filename("evaluation_20240101_120000.json") == "evaluation_20240101_120000.json"
