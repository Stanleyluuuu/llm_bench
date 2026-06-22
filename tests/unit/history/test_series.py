"""Tests for trend-series helpers — the null-vs-zero contract."""

from __future__ import annotations

from llm_benchmark.history.schema import ModelSummary, RunMetadata
from llm_benchmark.history.series import all_models_ever, build_series


def _meta(run_id: str, models: list[str], summary: dict[str, ModelSummary]) -> RunMetadata:
    return RunMetadata(
        run_id=run_id,
        timestamp=f"2026-05-27T{run_id[-6:-4]}:00:00+00:00",
        task_type="text_gen",
        models=models,
        judge="j",
        summary=summary,
        file=f"runs/{run_id}_run.json",
    )


def test_build_series_uses_null_when_model_absent():
    runs = [
        _meta(
            "20260527T100000",
            ["A", "B", "C"],
            {"A": ModelSummary(avg_score=4.0), "B": ModelSummary(avg_score=3.0), "C": ModelSummary(avg_score=2.0)},
        ),
        _meta(
            "20260527T110000",
            ["B", "C", "D"],
            {"B": ModelSummary(avg_score=3.5), "C": ModelSummary(avg_score=2.2), "D": ModelSummary(avg_score=4.8)},
        ),
    ]
    # A missing from run 2 → None (not 0)
    assert build_series(runs, "A", "avg_score") == [4.0, None]
    # D missing from run 1 → None
    assert build_series(runs, "D", "avg_score") == [None, 4.8]


def test_build_series_handles_missing_metric():
    runs = [_meta("20260527T100000", ["A"], {"A": ModelSummary(avg_score=4.0)})]
    # VLM metric not populated for LLM run
    assert build_series(runs, "A", "mean_iou") == [None]


def test_all_models_ever_is_insertion_order_union():
    runs = [
        _meta("20260527T100000", ["A", "B", "C"], {}),
        _meta("20260527T110000", ["B", "C", "D"], {}),
        _meta("20260527T120000", ["E"], {}),
    ]
    assert all_models_ever(runs) == ["A", "B", "C", "D", "E"]
