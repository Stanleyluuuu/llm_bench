"""Tests for the run-based history schema (modality-agnostic guards)."""

from __future__ import annotations

import pytest

from llm_benchmark.history.schema import (
    CaseInput,
    CaseResult,
    ModelOutput,
    ModelSummary,
    RunFile,
    Verdict,
)


def test_case_input_rejects_inline_base64_data_uri():
    with pytest.raises(ValueError, match="paths or hashes"):
        CaseInput(type="multimodal", prompt="q", images=["data:image/png;base64,iVBORw0K..."])


def test_case_input_rejects_oversized_string():
    huge = "x" * 5000
    with pytest.raises(ValueError, match="paths or hashes"):
        CaseInput(type="multimodal", prompt="q", images=[huge])


def test_case_input_accepts_path():
    ci = CaseInput(type="multimodal", prompt="q", images=["/abs/path/image.png"])
    assert ci.images == ["/abs/path/image.png"]


def test_case_input_text_no_images():
    ci = CaseInput(type="text", prompt="hello")
    assert ci.images == []


def test_run_file_roundtrip():
    rf = RunFile(
        run_id="20260527T110000",
        timestamp="2026-05-27T11:00:00+00:00",
        task="QC_Assistant",
        task_type="text_gen",
        models=["llm_large"],
        judge="LLM Large",
        cases=[
            CaseResult(
                case_id="case_0000",
                input=CaseInput(type="text", prompt="q"),
                ground_truth="gt",
                model_outputs={"llm_large": ModelOutput(answer="a", score=4.5)},
                verdict=Verdict(outcome="single_winner", winner_model_ids=["llm_large"], rationale="ok"),
            )
        ],
        summary={"llm_large": ModelSummary(w=1, avg_score=4.5)},
    )
    dumped = rf.model_dump(mode="json")
    assert dumped["run_id"] == "20260527T110000"
    assert dumped["cases"][0]["verdict"]["outcome"] == "single_winner"
    assert dumped["summary"]["llm_large"]["avg_score"] == 4.5
    # All optional VLM fields default to None
    assert dumped["summary"]["llm_large"]["mean_iou"] is None
