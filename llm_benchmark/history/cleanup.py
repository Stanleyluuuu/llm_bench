from datetime import datetime, timedelta, timezone
from pathlib import Path

from ..logging import logger
from .schema import Manifest
from .storage import read_manifest, write_manifest

RETENTION_DAYS = 7


def _parse_ts(ts: str) -> datetime | None:
    """Best-effort ISO-8601 parse with ``Z`` suffix support."""
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def cleanup_outdated_runs(task_dir: Path, *, now: datetime | None = None) -> int:
    """Delete runs older than ``RETENTION_DAYS`` and rewrite the manifest.

    ``now`` is overridable for tests. Returns the number of runs removed.
    Runs with an unparseable timestamp are kept (better safe than silent loss).
    """
    manifest_path = task_dir / "manifest.json"
    if not manifest_path.exists():
        return 0

    reference = now or datetime.now(timezone.utc)
    cutoff = reference - timedelta(days=RETENTION_DAYS)

    manifest = read_manifest(task_dir)
    kept = []
    removed = 0
    for entry in manifest.runs:
        ts = _parse_ts(entry.timestamp)
        if ts is None:
            logger.warning(
                "Cleanup keeping run with unparseable timestamp task=%s run_id=%s ts=%r",
                task_dir.name,
                entry.run_id,
                entry.timestamp,
            )
            kept.append(entry)
            continue
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if ts < cutoff:
            run_path = task_dir / entry.file
            if run_path.exists():
                try:
                    run_path.unlink()
                except OSError as exc:
                    logger.warning("Cleanup failed to unlink %s: %s", run_path, exc)
                    kept.append(entry)
                    continue
            removed += 1
        else:
            kept.append(entry)

    if removed:
        manifest = Manifest(task=manifest.task, schema_version=manifest.schema_version, runs=kept)
        write_manifest(task_dir, manifest)
        logger.info("Cleanup removed %d outdated run(s) task=%s", removed, task_dir.name)

    return removed
