"""Tests for atomic storage and manifest bookkeeping."""

from __future__ import annotations

import json
from pathlib import Path

from llm_benchmark.history.schema import (
    CaseInput,
    CaseResult,
    ModelOutput,
    ModelSummary,
    RunFile,
    Verdict,
)
from llm_benchmark.history.storage import read_manifest, read_run, save_run


def _make_run(run_id: str, models: tuple[str, ...] = ("llm_large",)) -> RunFile:
    return RunFile(
        run_id=run_id,
        timestamp=f"2026-05-27T{run_id[-6:-4]}:{run_id[-4:-2]}:{run_id[-2:]}+00:00",
        task="dummy",
        task_type="text_gen",
        models=list(models),
        judge="judge",
        cases=[
            CaseResult(
                case_id="case_0000",
                input=CaseInput(type="text", prompt="q"),
                ground_truth="gt",
                model_outputs={m: ModelOutput(answer="a") for m in models},
                verdict=Verdict(outcome="all_pass", winner_model_ids=list(models)),
            )
        ],
        summary={m: ModelSummary(w=1) for m in models},
    )


def test_save_run_creates_files_and_manifest(tmp_path: Path):
    run = _make_run("20260527T100000")
    save_run(tmp_path, run)
    assert (tmp_path / "manifest.json").is_file()
    assert (tmp_path / "runs" / "20260527T100000_run.json").is_file()

    manifest = read_manifest(tmp_path)
    assert len(manifest.runs) == 1
    assert manifest.runs[0].file == "runs/20260527T100000_run.json"


def test_save_run_appends_and_sorts(tmp_path: Path):
    save_run(tmp_path, _make_run("20260527T120000"))
    save_run(tmp_path, _make_run("20260527T100000"))
    save_run(tmp_path, _make_run("20260527T110000"))
    manifest = read_manifest(tmp_path)
    assert [r.run_id for r in manifest.runs] == [
        "20260527T100000",
        "20260527T110000",
        "20260527T120000",
    ]


def test_save_run_replaces_same_id(tmp_path: Path):
    save_run(tmp_path, _make_run("20260527T100000", models=("a",)))
    save_run(tmp_path, _make_run("20260527T100000", models=("a", "b")))
    manifest = read_manifest(tmp_path)
    assert len(manifest.runs) == 1
    assert manifest.runs[0].models == ["a", "b"]


def test_atomic_write_leaves_no_tmp(tmp_path: Path):
    save_run(tmp_path, _make_run("20260527T100000"))
    leftovers = list(tmp_path.rglob("*.tmp"))
    assert not leftovers


def test_read_run_returns_none_when_missing(tmp_path: Path):
    assert read_run(tmp_path, "20260101T000000") is None


def test_read_manifest_handles_corrupt_file(tmp_path: Path):
    (tmp_path / "manifest.json").write_text("{ not valid json", encoding="utf-8")
    manifest = read_manifest(tmp_path)
    assert manifest.runs == []


def test_manifest_json_is_pretty(tmp_path: Path):
    save_run(tmp_path, _make_run("20260527T100000"))
    raw = json.loads((tmp_path / "manifest.json").read_text(encoding="utf-8"))
    assert raw["schema_version"] == 1
