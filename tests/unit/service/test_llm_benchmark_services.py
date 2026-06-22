"""Tests for the new model-major runner package.

Covers: sample construction, adapter registry, CustomAPI skip behaviour,
scoring dispatch, and the Runner.evaluate model-major pivot.
"""

from __future__ import annotations

import json
from pathlib import Path

from llm_benchmark.samples import Sample, load_samples
from llm_benchmark.schema import (
    ModelKind,
    ModelRun,
    ModelSpec,
    ModelType,
    RunStatus,
    TaskConfig,
)
from llm_benchmark.scoring import dispatch_scoring

# ─── Fixtures ─────────────────────────────────────────────────────────────────


def _make_spec(
    mid: str = "custom:test",
    model_type: ModelType = ModelType.LLM,
    kind: ModelKind = ModelKind.CUSTOM,
) -> ModelSpec:
    return ModelSpec(
        id=mid,
        kind=kind,
        model_type=model_type,
        display_name="Test",
        name="gpt-test",
        api_base="http://localhost/v1",
        max_token=4096,
    )


def _write_jsonl(path: Path, rows: list[dict]) -> Path:
    """Write a list of dicts as JSONL to *path* and return it."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    return path


# ─── load_samples ─────────────────────────────────────────────────────────────


def test_load_samples_vlm_sets_image_path(tmp_path, monkeypatch):
    rows = [
        {"input": {"image": "a.jpg"}, "ground_truth": "1"},
        {"input": {"image": "b.jpg"}, "ground_truth": "2"},
    ]
    dataset_path = _write_jsonl(tmp_path / "dataset.jsonl", rows)
    monkeypatch.setattr("llm_benchmark.samples._PROJECTS_DIR", tmp_path.parent)

    config = TaskConfig(type="VLM", metrics="ragas", source="openai")
    samples = load_samples(tmp_path.name, config, dataset_path)
    assert len(samples) == 2
    assert samples[0].image_path == str(tmp_path.parent / tmp_path.name / "dataset" / "a.jpg")
    assert samples[0].form is None
    assert samples[0].question == "a.jpg"


def test_load_samples_llm_text_only(tmp_path):
    rows = [
        {"input": {"text": "hello"}, "ground_truth": "world"},
        {"input": {"text": "foo"}, "ground_truth": "bar"},
    ]
    dataset_path = _write_jsonl(tmp_path / "dataset.jsonl", rows)

    config = TaskConfig(type="LLM", metrics="ragas", source="openai")
    samples = load_samples("FakeProj", config, dataset_path)
    assert all(s.image_path is None for s in samples)
    assert all(s.form is None for s in samples)
    assert samples[0].question == "hello"


def test_load_samples_form_input_parses_dict_string(tmp_path):
    rows = [
        {"input": {"form": {"q": "x"}}, "ground_truth": "1"},
        {"input": {"text": "raw"}, "ground_truth": "2"},
    ]
    dataset_path = _write_jsonl(tmp_path / "dataset.jsonl", rows)

    config = TaskConfig(
        type="LLM",
        metrics="ragas",
        source="flowise",
        inference_params={
            "base_url": "https://x",
            "flow_id": "abc",
            "form_input": True,
            "form_key": {"q": ""},
        },
    )
    samples = load_samples("FakeProj", config, dataset_path)
    assert samples[0].form == {"q": "x"}
    assert samples[1].form is None


# ─── dispatch_scoring routing ─────────────────────────────────────────────────


def test_dispatch_scoring_returns_empty_when_no_results():
    cfg = TaskConfig(
        type="LLM",
        metrics="ragas",
        source="openai",
    )
    scores = dispatch_scoring({}, cfg, "proj", {})
    assert scores == {}


def test_dispatch_scoring_output_parser_key():
    results = {"m1": {"question": [], "answer": [], "ground_truth": []}}
    config = TaskConfig(
        type="LLM",
        metrics="OutputParser",
        source="flowise",
        inference_params={
            "base_url": "https://x",
            "flow_id": "abc",
            "outputparser_key": {},
        },
    )
    scores = dispatch_scoring(results, config, "proj", {})
    assert "m1" in scores


def test_dispatch_scoring_exact_match_returns_zero_for_empty():
    results = {"m1": {"question": [], "answer": [], "ground_truth": []}}
    config = TaskConfig(
        type="LLM",
        metrics="exact_match",
        source="openai",
    )
    scores = dispatch_scoring(results, config, "proj", {})
    # exact_match with no answers returns empty dict (same as other scorers)
    assert scores == {"m1": {}}


# ─── CustomAPI wired up (Phase 3) ────────────────────────────────────────────


def test_runner_customapi_project_invokes_custom_source(monkeypatch):
    """Projects with source=custom flow through run_source."""
    from llm_benchmark.runner import Runner

    config = TaskConfig(
        type="LLM",
        metrics="llm",
        source="custom",
        inference_params={
            "api_new": "https://api/new",
            "api_param": {"employee_id": "e", "question": "q"},
        },
    )
    spec = _make_spec("llm_large", kind=ModelKind.BUILTIN)
    fake_samples = [
        Sample(question="hi", ground_truth="g", image_path=None, form=None),
    ]

    captured: dict = {}

    def fake_run_source(cfg, samples, selected):
        captured["called"] = True
        captured["selected_ids"] = [s.id for s in selected]
        return {
            s.id: {"question": ["hi"], "answer": ["a"], "ground_truth": ["g"], "response_time": [0.1]} for s in selected
        }

    monkeypatch.setattr("llm_benchmark.runner.save_project_results", lambda *_a, **_kw: None)
    monkeypatch.setattr(
        "llm_benchmark.runner.run_source",
        fake_run_source,
    )
    monkeypatch.setattr(
        "llm_benchmark.runner.dispatch_scoring",
        lambda *_a, **_kw: {spec.id: {}},
    )

    runner_obj = Runner.__new__(Runner)
    runner_obj._task_configs = {"FakeProj": config}
    runner_obj._project_samples = {"FakeProj": fake_samples}

    result = runner_obj._evaluate_project("FakeProj", {spec.id: spec})

    assert captured.get("called") is True
    assert captured["selected_ids"] == [spec.id]
    assert result[spec.id].status == RunStatus.OK


# ─── model-major pivot ───────────────────────────────────────────────────────


def test_runner_evaluate_pivots_to_model_major(monkeypatch):
    """Runner.evaluate returns {model_id: {project: ModelRun}}."""
    from llm_benchmark.runner import Runner

    spec = _make_spec("llm_large", kind=ModelKind.BUILTIN)
    fake_run = ModelRun(status=RunStatus.SKIPPED, reason="customapi_unsupported")

    runner_obj = Runner.__new__(Runner)
    runner_obj._builtin_adapters = {}

    def fake_evaluate_project(project, specs_by_id, **_kwargs):
        return {spec.id: fake_run}

    monkeypatch.setattr(runner_obj, "_evaluate_project", fake_evaluate_project)

    result = runner_obj.evaluate(["ProjA", "ProjB"], [spec])
    assert set(result.keys()) == {spec.id}
    assert set(result[spec.id].keys()) == {"ProjA", "ProjB"}
    assert result[spec.id]["ProjA"].status == RunStatus.SKIPPED
