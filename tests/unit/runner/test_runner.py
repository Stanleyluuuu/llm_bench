"""Tests for llm_benchmark.runner.Runner — new model-major interface."""

from __future__ import annotations

from llm_benchmark.runner import Runner
from llm_benchmark.schema import ModelKind, ModelRun, ModelSpec, ModelType, RunStatus

# ─── helpers ──────────────────────────────────────────────────────────────────


def _make_spec(
    model_id: str,
    model_type: ModelType = ModelType.LLM,
    kind: ModelKind = ModelKind.BUILTIN,
) -> ModelSpec:
    return ModelSpec(
        id=model_id,
        kind=kind,
        model_type=model_type,
        display_name=model_id,
        name=model_id,
        api_base="http://fake",
        max_token=512,
    )


# ─── Runner.evaluate — model-major pivot ──────────────────────────────────────


def test_runner_evaluate_pivots_to_model_major(monkeypatch):
    """evaluate() returns {model_id: {project: ModelRun}} model-major shape."""
    spec = _make_spec("llm_large")
    fake_run = ModelRun(status=RunStatus.OK)

    runner_obj = Runner.__new__(Runner)
    runner_obj._builtin_adapters = {}

    def fake_evaluate_project(project, specs_by_id, **_kwargs):
        return {spec.id: fake_run}

    monkeypatch.setattr(runner_obj, "_evaluate_project", fake_evaluate_project)

    result = runner_obj.evaluate(["ProjA", "ProjB"], [spec])
    assert set(result.keys()) == {spec.id}
    assert set(result[spec.id].keys()) == {"ProjA", "ProjB"}
    assert result[spec.id]["ProjA"].status == RunStatus.OK


def test_runner_evaluate_multi_model_multi_project(monkeypatch):
    """Each model gets an entry for every project."""
    spec_a = _make_spec("llm_large")
    spec_b = _make_spec("llm_small")

    runner_obj = Runner.__new__(Runner)
    runner_obj._builtin_adapters = {}

    def fake_evaluate_project(project, specs_by_id, **_kwargs):
        return {mid: ModelRun(status=RunStatus.OK) for mid in specs_by_id}

    monkeypatch.setattr(runner_obj, "_evaluate_project", fake_evaluate_project)

    result = runner_obj.evaluate(["P1", "P2", "P3"], [spec_a, spec_b])
    assert set(result.keys()) == {"llm_large", "llm_small"}
    for mid in ("llm_large", "llm_small"):
        assert set(result[mid].keys()) == {"P1", "P2", "P3"}
