"""Run-based history mechanism.

Layered on top of the existing model-major ``evaluation_*.json`` persistence.
Stores per-task run snapshots in ``dataset/{project}/output/runs/`` indexed by
``dataset/{project}/output/manifest.json``, with a 7-day lazy cleanup policy.
"""

from .builder import build_run_file
from .cleanup import RETENTION_DAYS, cleanup_outdated_runs
from .schema import (
    CaseInput,
    CaseResult,
    ModelOutput,
    ModelSummary,
    RunFile,
    RunMetadata,
    Verdict,
)
from .series import all_models_ever, build_series
from .storage import read_manifest, read_run, save_run, write_manifest

__all__ = [
    "RETENTION_DAYS",
    "CaseInput",
    "CaseResult",
    "ModelOutput",
    "ModelSummary",
    "RunFile",
    "RunMetadata",
    "Verdict",
    "all_models_ever",
    "build_run_file",
    "build_series",
    "cleanup_outdated_runs",
    "read_manifest",
    "read_run",
    "save_run",
    "write_manifest",
]
