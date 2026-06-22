"""Tests for the 7-day lazy cleanup policy."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from llm_benchmark.history.cleanup import RETENTION_DAYS, cleanup_outdated_runs
from llm_benchmark.history.schema import (
    CaseInput,
    CaseResult,
    ModelOutput,
    ModelSummary,
    RunFile,
    Verdict,
)
from llm_benchmark.history.storage import read_manifest, save_run


def _make_run(run_id: str, ts: datetime) -> RunFile:
    return RunFile(
        run_id=run_id,
        timestamp=ts.astimezone(timezone.utc).isoformat(),
        task="dummy",
        task_type="text_gen",
        models=["a"],
        judge="j",
        cases=[
            CaseResult(
                case_id="case_0000",
                input=CaseInput(type="text", prompt="q"),
                ground_truth="gt",
                model_outputs={"a": ModelOutput(answer="x")},
                verdict=Verdict(outcome="all_pass", winner_model_ids=["a"]),
            )
        ],
        summary={"a": ModelSummary(w=1)},
    )


def test_cleanup_removes_old_runs_and_updates_manifest(tmp_path: Path):
    now = datetime(2026, 5, 27, 12, 0, tzinfo=timezone.utc)
    old = now - timedelta(days=RETENTION_DAYS + 1)
    fresh = now - timedelta(days=1)

    save_run(tmp_path, _make_run("20260520T100000", old))
    save_run(tmp_path, _make_run("20260526T120000", fresh))

    removed = cleanup_outdated_runs(tmp_path, now=now)
    assert removed == 1

    manifest = read_manifest(tmp_path)
    assert [r.run_id for r in manifest.runs] == ["20260526T120000"]
    assert not (tmp_path / "runs" / "20260520T100000_run.json").exists()
    assert (tmp_path / "runs" / "20260526T120000_run.json").exists()


def test_cleanup_noop_when_all_fresh(tmp_path: Path):
    now = datetime(2026, 5, 27, 12, 0, tzinfo=timezone.utc)
    save_run(tmp_path, _make_run("20260526T120000", now - timedelta(hours=1)))
    removed = cleanup_outdated_runs(tmp_path, now=now)
    assert removed == 0


def test_cleanup_noop_when_no_manifest(tmp_path: Path):
    assert cleanup_outdated_runs(tmp_path) == 0


def test_cleanup_keeps_unparseable_timestamps(tmp_path: Path):
    now = datetime(2026, 5, 27, 12, 0, tzinfo=timezone.utc)
    save_run(tmp_path, _make_run("20260526T120000", now - timedelta(hours=1)))
    # Manually corrupt the timestamp in manifest
    manifest = read_manifest(tmp_path)
    manifest.runs[0].timestamp = "not-a-date"
    from llm_benchmark.history.storage import write_manifest

    write_manifest(tmp_path, manifest)

    removed = cleanup_outdated_runs(tmp_path, now=now)
    assert removed == 0
    assert len(read_manifest(tmp_path).runs) == 1
