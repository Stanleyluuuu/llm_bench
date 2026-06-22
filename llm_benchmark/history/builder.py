"""Build a :class:`RunFile` from the runner's per-project ``ModelRun`` map.

This module is the only place that knows how to translate the legacy
model-major shape (`ModelRun.result`, `ModelRun.score`) into the new
modality-agnostic case-major shape (`CaseResult`, `ModelOutput`, `Verdict`).
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from ..logging import logger
from ..samples import Sample
from ..schema import ModelRun, ModelSpec, RunStatus, TaskConfig
from .schema import (
    CaseInput,
    CaseResult,
    ModelOutput,
    ModelSummary,
    RunFile,
    TaskTypeLiteral,
    Verdict,
)

# Two means within this epsilon count as a draw when deciding all_pass.
_VLM_TIE_EPSILON = 1e-6


def _derive_task_type(config: TaskConfig) -> TaskTypeLiteral:
    """VLM + IoU metrics → ``vlm_detection``; everything else → ``text_gen``."""
    if config.type == "VLM" and config.metrics == "iou":
        return "vlm_detection"
    return "text_gen"


def _vlm_threshold(config: TaskConfig) -> float:
    try:
        return float(config.inference_params.get("iou_threshold", 0.5))
    except (TypeError, ValueError):
        return 0.5


def _ok_runs(runs_by_model: dict[str, ModelRun]) -> dict[str, ModelRun]:
    return {mid: r for mid, r in runs_by_model.items() if r.status == RunStatus.OK}


def _per_sample_iou(run: ModelRun) -> list[float | None]:
    """Pull per-sample mean IoU from a VLM run, mapping parse errors to ``None``.

    ``per_sample_iou_detail`` is the canonical per-sample dimension (one entry
    per dataset row, with parse-error placeholders). ``per_sample_mean_iou``
    only contains the successful rows, so we walk the detail list and consume
    means in order.
    """
    detail = (run.result or {}).get("per_sample_iou_detail") or []
    raw_means = (run.score or {}).get("per_sample_mean_iou") or []
    mean_iter = iter(raw_means)
    out: list[float | None] = []
    for d in detail:
        if isinstance(d, dict) and "_parse_error" in d:
            out.append(None)
            continue
        try:
            out.append(float(next(mean_iter)))
        except (StopIteration, TypeError, ValueError):
            out.append(None)
    return out


def _llm_judgement(run: ModelRun) -> list[dict[str, Any]]:
    if not run.result:
        return []
    raw = run.result.get("llm_judgement") or []
    return [j for j in raw if isinstance(j, dict)]


def _build_vlm_verdict(
    case_idx: int,
    ok_runs: dict[str, ModelRun],
    threshold: float,
) -> Verdict:
    """Pick the model(s) with the highest per-case IoU; classify outcome."""
    ious: dict[str, float] = {}
    for mid, run in ok_runs.items():
        per = _per_sample_iou(run)
        if case_idx < len(per) and per[case_idx] is not None:
            ious[mid] = per[case_idx]

    if not ious:
        return Verdict(outcome="tie", winner_model_ids=[], rationale="no valid IoU for this case")

    best = max(ious.values())
    winners = sorted(mid for mid, v in ious.items() if abs(v - best) < _VLM_TIE_EPSILON)

    if best >= threshold and all(v >= threshold for v in ious.values()):
        return Verdict(
            outcome="all_pass",
            winner_model_ids=winners,
            rationale=f"all models reached IoU≥{threshold:.2f}; top={best:.3f}",
        )
    if len(winners) > 1:
        return Verdict(
            outcome="tie",
            winner_model_ids=winners,
            rationale=f"tie at IoU={best:.3f}",
        )
    return Verdict(
        outcome="single_winner",
        winner_model_ids=winners,
        rationale=f"best IoU={best:.3f}{' (below threshold)' if best < threshold else ''}",
    )


def _build_llm_verdict(case_idx: int, ok_runs: dict[str, ModelRun]) -> Verdict:
    """Use the judge's verdict from any model's ``llm_judgement`` blob (they share it)."""
    for run in ok_runs.values():
        judgements = _llm_judgement(run)
        if case_idx < len(judgements):
            j = judgements[case_idx]
            outcome = j.get("outcome")
            winners = list(j.get("winner_model_ids") or [])
            rationale = str(j.get("reason") or "")
            if outcome in ("single_winner", "tie"):
                return Verdict(outcome=outcome, winner_model_ids=winners, rationale=rationale)
    # No judge data → record all-pass with all models so downstream tallies don't break.
    return Verdict(
        outcome="all_pass",
        winner_model_ids=sorted(ok_runs.keys()),
        rationale="no judge verdict available",
    )


def _build_case_input(sample: Sample) -> CaseInput:
    if sample.image_path:
        return CaseInput(type="multimodal", prompt=str(sample.question), images=[sample.image_path])
    return CaseInput(type="text", prompt=str(sample.question), images=[])


def _build_model_outputs(
    case_idx: int,
    ok_runs: dict[str, ModelRun],
    task_type: TaskTypeLiteral,
) -> dict[str, ModelOutput]:
    outputs: dict[str, ModelOutput] = {}
    for mid, run in ok_runs.items():
        result = run.result or {}
        answers = result.get("answer") or []
        answer = str(answers[case_idx]).strip() if case_idx < len(answers) else ""
        score: float | None = None
        if task_type == "vlm_detection":
            per = _per_sample_iou(run)
            if case_idx < len(per):
                score = per[case_idx]
        else:
            judgements = _llm_judgement(run)
            if case_idx < len(judgements):
                avg = judgements[case_idx].get("average_score")
                if isinstance(avg, int | float):
                    score = float(avg)
        outputs[mid] = ModelOutput(answer=answer, score=score)
    return outputs


def _tally_wins(cases: list[CaseResult], all_models: list[str]) -> dict[str, tuple[int, int, int]]:
    """Return ``{model_id: (w, t, l)}`` over the case verdicts."""
    counts = {mid: [0, 0, 0] for mid in all_models}
    for case in cases:
        winners = set(case.verdict.winner_model_ids)
        if case.verdict.outcome == "all_pass":
            for mid in all_models:
                if mid in counts:
                    counts[mid][1] += 1  # treat all_pass as a tie for everyone
            continue
        if case.verdict.outcome == "tie":
            for mid in all_models:
                if mid not in counts:
                    continue
                counts[mid][1 if mid in winners else 2] += 1
            continue
        # single_winner
        for mid in all_models:
            if mid not in counts:
                continue
            if mid in winners:
                counts[mid][0] += 1
            else:
                counts[mid][2] += 1
    return {mid: (c[0], c[1], c[2]) for mid, c in counts.items()}


def _build_summary(
    cases: list[CaseResult],
    ok_runs: dict[str, ModelRun],
    task_type: TaskTypeLiteral,
    threshold: float | None,
) -> dict[str, ModelSummary]:
    wtl = _tally_wins(cases, list(ok_runs.keys()))
    summary: dict[str, ModelSummary] = {}
    for mid, run in ok_runs.items():
        w, t, lose = wtl.get(mid, (0, 0, 0))
        entry = ModelSummary(w=w, t=t, losses=lose)
        if task_type == "vlm_detection":
            per = _per_sample_iou(run)
            valid = [v for v in per if v is not None]
            entry.mean_iou = sum(valid) / len(valid) if valid else None
            entry.threshold = threshold
            if threshold is not None and valid:
                passed = sum(1 for v in valid if v >= threshold)
                entry.pass_rate = passed / len(valid)
        else:
            judgements = _llm_judgement(run)
            scores = [float(j["average_score"]) for j in judgements if isinstance(j.get("average_score"), int | float)]
            if scores:
                entry.avg_score = sum(scores) / len(scores)
        summary[mid] = entry
    return summary


def _utc_run_id(when: datetime | None = None) -> str:
    """Generate a run id of the form ``YYYYMMDDTHHMMSS`` (UTC, lexicographic)."""
    moment = (when or datetime.now(timezone.utc)).astimezone(timezone.utc)
    return moment.strftime("%Y%m%dT%H%M%S")


def build_run_file(
    *,
    project: str,
    config: TaskConfig,
    samples: list[Sample],
    runs_by_model: dict[str, ModelRun],
    specs_by_id: dict[str, ModelSpec],
    judge_id: str = "llm_large",
    now: datetime | None = None,
) -> RunFile | None:
    """Translate one project's run into a :class:`RunFile`.

    Returns ``None`` when no model succeeded (nothing worth recording).
    """
    ok = _ok_runs(runs_by_model)
    if not ok:
        logger.info("History skip — no OK runs for project=%s", project)
        return None

    task_type = _derive_task_type(config)
    threshold = _vlm_threshold(config) if task_type == "vlm_detection" else None

    cases: list[CaseResult] = []
    for idx, sample in enumerate(samples):
        verdict = (
            _build_vlm_verdict(idx, ok, threshold or 0.5)
            if task_type == "vlm_detection"
            else _build_llm_verdict(idx, ok)
        )
        cases.append(
            CaseResult(
                case_id=f"case_{idx:04d}",
                input=_build_case_input(sample),
                ground_truth=str(sample.ground_truth),
                model_outputs=_build_model_outputs(idx, ok, task_type),
                verdict=verdict,
            )
        )

    summary = _build_summary(cases, ok, task_type, threshold)
    moment = now or datetime.now(timezone.utc)
    iso_ts = moment.astimezone(timezone.utc).isoformat()
    # Resolve the judge label: prefer the configured judge id; fall back to spec display name.
    judge_label = judge_id
    if judge_id in specs_by_id:
        judge_label = specs_by_id[judge_id].display_name or judge_id

    return RunFile(
        run_id=_utc_run_id(moment),
        timestamp=iso_ts,
        task=project,
        task_type=task_type,
        models=sorted(ok.keys()),
        judge=judge_label,
        cases=cases,
        summary=summary,
    )
