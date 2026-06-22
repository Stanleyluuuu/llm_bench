import json
import os
import tempfile
import threading
from pathlib import Path

from ..logging import logger
from .schema import HISTORY_SCHEMA_VERSION, Manifest, RunFile, RunMetadata

MANIFEST_FILENAME = "manifest.json"
RUNS_SUBDIR = "runs"

_manifest_locks_meta = threading.Lock()
_manifest_locks: dict[str, threading.Lock] = {}


def _lock_for_task(task_dir: Path) -> threading.Lock:
    """Return the manifest lock for *task_dir*, creating it once if needed."""
    key = str(task_dir.resolve())
    with _manifest_locks_meta:
        lock = _manifest_locks.get(key)
        if lock is None:
            lock = threading.Lock()
            _manifest_locks[key] = lock

        return lock


def _atomic_write_json(path: Path, payload: dict) -> None:
    """Write JSON atomically: tmp file in same dir → ``os.replace``.

    Same-directory tmp is required so the rename is atomic on POSIX filesystems.
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


def read_manifest(task_dir: Path) -> Manifest:
    """Load manifest from disk, or return an empty one if absent.

    Malformed JSON resets the manifest (logged); the corrupt file is left for inspection.
    """
    manifest_path = task_dir / MANIFEST_FILENAME
    if not manifest_path.exists():
        return Manifest(task=task_dir.name)

    try:
        raw = json.loads(manifest_path.read_text(encoding="utf-8"))
        return Manifest.model_validate(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error(
            "Manifest %s unreadable (%s) — returning empty manifest; corrupt file left on disk",
            manifest_path,
            exc,
        )

        return Manifest(task=task_dir.name)


def write_manifest(task_dir: Path, manifest: Manifest) -> None:
    """Atomically persist the manifest."""
    manifest_path = task_dir / MANIFEST_FILENAME
    _atomic_write_json(manifest_path, manifest.model_dump(mode="json"))


def save_run(task_dir: Path, run: RunFile) -> Path:
    """Persist a ``RunFile`` and append its metadata to the manifest.

    Both writes are atomic. The manifest read-modify-write is serialized per task so
    concurrent saves to the same project cannot drop each other's entries.
    Returns the run-file path.
    """
    run_filename = f"{run.run_id}_run.json"
    run_path = task_dir / RUNS_SUBDIR / run_filename
    # Unique filename + atomic write — safe to do outside the manifest lock.
    _atomic_write_json(run_path, run.model_dump(mode="json"))

    with _lock_for_task(task_dir):
        manifest = read_manifest(task_dir)
        if manifest.task != task_dir.name:
            manifest.task = task_dir.name
        # Replace any existing entry with the same run_id to keep the manifest unique.
        manifest.runs = [r for r in manifest.runs if r.run_id != run.run_id]
        manifest.runs.append(
            RunMetadata(
                run_id=run.run_id,
                timestamp=run.timestamp,
                task_type=run.task_type,
                models=list(run.models),
                judge=run.judge,
                summary=dict(run.summary),
                file=f"{RUNS_SUBDIR}/{run_filename}",
            )
        )
        manifest.runs.sort(key=lambda r: r.run_id)
        manifest.schema_version = HISTORY_SCHEMA_VERSION
        write_manifest(task_dir, manifest)

    logger.info("History run saved task=%s run_id=%s", task_dir.name, run.run_id)
    return run_path


def read_run(task_dir: Path, run_id: str) -> RunFile | None:
    """Load a full run snapshot by id. Returns ``None`` if the file is missing."""
    run_path = task_dir / RUNS_SUBDIR / f"{run_id}_run.json"
    if not run_path.exists():
        return None
    
    raw = json.loads(run_path.read_text(encoding="utf-8"))

    return RunFile.model_validate(raw)
