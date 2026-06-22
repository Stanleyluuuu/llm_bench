"""Tests for ``build_run_file`` — the only place that maps ModelRun → RunFile."""

from __future__ import annotations

from datetime import datetime, timezone

from llm_benchmark.history.builder import build_run_file
from llm_benchmark.samples import Sample
from llm_benchmark.schema import (
    ModelKind,
    ModelRun,
    ModelSpec,
    ModelType,
    RunStatus,
    TaskConfig,
)


def _spec(mid: str, model_type: ModelType = ModelType.LLM) -> ModelSpec:
    return ModelSpec(
        id=mid,
        kind=ModelKind.BUILTIN,
        model_type=model_type,
        display_name=mid.upper(),
        name=mid,
        api_base="http://x",
    )


def test_vlm_run_summary_includes_pass_rate_and_mean_iou():
    config = TaskConfig(type="VLM", metrics="iou", source="openai", inference_params={"iou_threshold": 0.5})
    samples = [
        Sample(question="q1", ground_truth="gt1", image_path="/img/1.png"),
        Sample(question="q2", ground_truth="gt2", image_path="/img/2.png"),
    ]
    runs = {
        "vlm_large": ModelRun(
            status=RunStatus.OK,
            score={
                "mean_iou": 0.7,
                "per_sample_mean_iou": [0.8, 0.6],
                "iou_threshold": 0.5,
            },
            result={"answer": ["a1", "a2"], "per_sample_iou_detail": [{}, {}]},
        ),
        "vlm_small": ModelRun(
            status=RunStatus.OK,
            score={
                "mean_iou": 0.3,
                "per_sample_mean_iou": [0.4, 0.2],
                "iou_threshold": 0.5,
            },
            result={"answer": ["b1", "b2"], "per_sample_iou_detail": [{}, {}]},
        ),
    }
    specs = {mid: _spec(mid, ModelType.VLM) for mid in runs}

    rf = build_run_file(
        project="Plate_Detection",
        config=config,
        samples=samples,
        runs_by_model=runs,
        specs_by_id=specs,
        now=datetime(2026, 5, 27, 11, 0, tzinfo=timezone.utc),
    )

    assert rf is not None
    assert rf.task_type == "vlm_detection"
    assert rf.run_id == "20260527T110000"
    assert rf.summary["vlm_large"].pass_rate == 1.0  # both samples >= 0.5
    assert rf.summary["vlm_small"].pass_rate == 0.0  # both samples below 0.5
    assert rf.summary["vlm_large"].mean_iou == 0.7
    assert rf.summary["vlm_large"].threshold == 0.5
    # First case: vlm_large 0.8 vs vlm_small 0.4 → single_winner = vlm_large
    assert rf.cases[0].verdict.outcome == "single_winner"
    assert rf.cases[0].verdict.winner_model_ids == ["vlm_large"]
    # Per-case score equals per_sample_mean_iou
    assert rf.cases[0].model_outputs["vlm_large"].score == 0.8


def test_llm_run_uses_judgement_blob():
    config = TaskConfig(type="LLM", metrics="llm", source="openai")
    samples = [Sample(question="q1", ground_truth="gt")]
    judgement = [
        {"outcome": "single_winner", "winner_model_ids": ["llm_large"], "reason": "better", "average_score": 4.5}
    ]
    runs = {
        "llm_large": ModelRun(
            status=RunStatus.OK,
            score={},
            result={"answer": ["A1"], "llm_judgement": judgement},
        ),
        "llm_small": ModelRun(
            status=RunStatus.OK,
            score={},
            result={"answer": ["B1"], "llm_judgement": judgement},
        ),
    }
    specs = {mid: _spec(mid) for mid in runs}
    rf = build_run_file(
        project="QC_Assistant",
        config=config,
        samples=samples,
        runs_by_model=runs,
        specs_by_id=specs,
    )
    assert rf is not None
    assert rf.task_type == "text_gen"
    assert rf.cases[0].verdict.outcome == "single_winner"
    assert rf.cases[0].verdict.winner_model_ids == ["llm_large"]
    assert rf.summary["llm_large"].w == 1
    assert rf.summary["llm_small"].losses == 1
    assert rf.summary["llm_large"].avg_score == 4.5
    # VLM-only fields stay None for LLM task
    assert rf.summary["llm_large"].pass_rate is None
    assert rf.summary["llm_large"].mean_iou is None


def test_returns_none_when_no_ok_runs():
    config = TaskConfig(type="LLM", metrics="llm", source="openai")
    runs = {"a": ModelRun(status=RunStatus.ERROR, error="boom")}
    rf = build_run_file(
        project="x",
        config=config,
        samples=[Sample(question="q", ground_truth="g")],
        runs_by_model=runs,
        specs_by_id={"a": _spec("a")},
    )
    assert rf is None


def test_vlm_parse_error_does_not_pollute_pass_rate():
    config = TaskConfig(type="VLM", metrics="iou", source="openai", inference_params={"iou_threshold": 0.5})
    samples = [
        Sample(question="q1", ground_truth="gt1", image_path="/img/1.png"),
        Sample(question="q2", ground_truth="gt2", image_path="/img/2.png"),
    ]
    # In real scoring, per_sample_mean_iou only contains successful rows;
    # the parse-error row is marked in per_sample_iou_detail only.
    runs = {
        "vlm_large": ModelRun(
            status=RunStatus.OK,
            score={"per_sample_mean_iou": [0.9], "iou_threshold": 0.5},
            result={"answer": ["a1", "a2"], "per_sample_iou_detail": [{}, {"_parse_error": "bad"}]},
        ),
    }
    specs = {"vlm_large": _spec("vlm_large", ModelType.VLM)}
    rf = build_run_file(project="x", config=config, samples=samples, runs_by_model=runs, specs_by_id=specs)
    assert rf is not None
    # Only the first sample counts; parse error → None
    assert rf.summary["vlm_large"].pass_rate == 1.0
    assert rf.summary["vlm_large"].mean_iou == 0.9
    assert rf.cases[0].model_outputs["vlm_large"].score == 0.9
    assert rf.cases[1].model_outputs["vlm_large"].score is None
