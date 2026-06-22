"""Trend-series helpers.

Two rules drive everything:

1. **Never fill 0 for missing models.** A model that didn't participate in a run
   gets ``None`` so the frontend chart breaks the line (not a fake "scored 0").
2. **The model legend is the union of every model ever seen**, not just the
   latest run, so users can still inspect retired models.
"""

from __future__ import annotations

from .schema import RunMetadata


def build_series(runs: list[RunMetadata], model_id: str, metric: str) -> list[float | None]:
    """Build one model's metric series across runs. ``None`` marks "did not participate"."""
    out: list[float | None] = []
    for run in runs:
        if model_id not in run.models:
            out.append(None)
            continue
        summary = run.summary.get(model_id)
        if summary is None:
            out.append(None)
            continue
        value = getattr(summary, metric, None)
        out.append(float(value) if isinstance(value, int | float) else None)
    return out


def all_models_ever(runs: list[RunMetadata]) -> list[str]:
    """Insertion-order union of every model that ever appeared in any run."""
    seen: list[str] = []
    for run in runs:
        for mid in run.models:
            if mid not in seen:
                seen.append(mid)
    return seen
