"""Service route smoke tests: no auth module exists, all /api/* routes are open."""

from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from llm_benchmark.service.app import create_app


def _client() -> TestClient:
    return TestClient(create_app())


def test_config_endpoint_accessible():
    """/api/config returns 200 with no credentials required."""
    resp = _client().get("/api/config")
    assert resp.status_code == 200


def test_projects_endpoint_accessible():
    """/api/projects returns 200 with no credentials required."""
    resp = _client().get("/api/projects")
    assert resp.status_code == 200


def test_evaluate_rejects_unknown_project():
    """POST /api/evaluate with an unknown project name must return 400."""
    resp = _client().post("/api/evaluate", json={"projects": ["nonexistent_xyz"]})
    assert resp.status_code == 400


def test_evaluate_accepts_valid_project():
    """POST /api/evaluate with a real project name returns 202."""

    def _fake_eval(*args, **kwargs):
        projects = kwargs.get("projects", args[0] if args else [])
        fake = ({}, {}, {"question": [], "answer": [], "ground_truth": []})
        return {p: {"model": (fake, fake, [])} for p in projects}

    with patch("llm_benchmark.runner.Runner.evaluate", side_effect=_fake_eval):
        resp = _client().post("/api/evaluate", json={"projects": ["Grounding"]})
    assert resp.status_code == 202
