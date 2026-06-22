import json
import math
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

from .logging import logger
from .schema import ModelRun, ModelSpec, RunStatus
from .settings import PROJECTS_DIR

SCHEMA_VERSION = 2
MAX_HISTORY_FILES = 10


def _atomic_write_json(path: Path, payload: Any) -> None:
    """Write JSON atomically: tmp file in same dir → ``os.replace``.

    Same-directory tmp is required so the rename is atomic on POSIX filesystems.
    Mirrors the helper in ``history/storage.py`` for a consistent write convention.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=path.name + ".", suffix=".tmp")
    tmp_path = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    except Exception:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError as exc:
                logger.warning("Failed to clean tmp %s: %s", tmp_path, exc)
        raise


def _prune_old_history(output_dir: Path, max_files: int) -> None:
    """
    Delete the oldest evaluation JSON files beyond *max_files* per project.

    Files are sorted by filename (``evaluation_{YYYYmmdd_HHMMSS_ffffff}.json``),
    so lexicographic order equals chronological order. Oldest entries are
    deleted first, keeping at most *max_files* files.
    """
    all_files = sorted(output_dir.glob("evaluation_*.json"))
    excess = len(all_files) - max_files
    if excess <= 0:
        return

    to_delete = all_files[:excess]
    for old_file in to_delete:
        try:
            old_file.unlink()
            logger.info("History pruned file=%s", old_file.name)
        except OSError as exc:
            logger.warning("History prune failed file=%s error=%s", old_file.name, exc)


def _format_score(score: Any) -> dict[str, Any]:
    """
    Coerce a RAGAS Result or plain dict into a flat aggregated dict.
    """
    if score is None:
        return {}

    scores_dict = score.to_pandas().to_dict() if hasattr(score, "to_pandas") else dict(score)
    if scores_dict and isinstance(next(iter(scores_dict.values())), dict):
        aggregated: dict[str, Any] = {}
        per_sample: dict[str, list] = {}

        for k, v in scores_dict.items():
            values = list(v.values()) if isinstance(v, dict) else [v]
            if values and isinstance(values[0], int | float):
                aggregated[k] = sum(values) / len(values)
                per_sample[f"per_sample_{k}"] = values
        # Stash per-sample arrays in the aggregated dict under per_sample_* keys.
        aggregated.update(per_sample)

        return aggregated

    return scores_dict


def _sanitize(obj: Any) -> Any:
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]

    return obj


def save_project_results(project: str, runs_by_model: dict[str, ModelRun], specs_by_id: dict[str, ModelSpec]) -> str:
    """
    Write a single per-project JSON file (model-major shape, schema v2).
    """
    output_dir = PROJECTS_DIR / project / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    now = datetime.now()
    # Microsecond precision in the filename avoids collisions between concurrent
    # same-project writes while keeping lexicographic == chronological ordering.
    file_timestamp = now.strftime("%Y%m%d_%H%M%S_%f")
    timestamp = now.strftime("%Y%m%d_%H%M%S")
    filepath = output_dir / f"evaluation_{file_timestamp}.json"

    models_payload: dict[str, Any] = {}
    for mid, run in runs_by_model.items():
        spec = specs_by_id.get(mid)
        entry: dict[str, Any] = {
            "spec": spec.to_info() if spec is not None else {"id": mid},
            "status": run.status.value,
        }
        if run.status == RunStatus.OK:
            entry["scores"] = _format_score(run.score)
            entry["performance"] = run.perf or {}
            entry["results"] = run.result or {}
        elif run.status == RunStatus.ERROR:
            entry["error"] = run.error or ""
        elif run.status == RunStatus.SKIPPED:
            entry["reason"] = run.reason or ""

        models_payload[mid] = entry

    payload = {
        "project": project,
        "timestamp": timestamp,
        "datetime": now.strftime("%Y-%m-%d %H:%M:%S"),
        "schema_version": SCHEMA_VERSION,
        "models": models_payload,
    }

    _atomic_write_json(filepath, _sanitize(payload))

    logger.info("Saved evaluation file project=%s path=%s", project, filepath)

    _prune_old_history(output_dir, MAX_HISTORY_FILES)

    return str(filepath)
