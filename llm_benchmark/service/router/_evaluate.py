import json
import threading
from typing import Any

from devtools.fastapi import get_shared_object
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from llm_benchmark.logging import logger
from llm_benchmark.schema import EvaluateRequest, ModelKind, ModelSpec, RunStatus
from llm_benchmark.service.router._helpers import (
    SCHEMA_VERSION,
    _format_perf,
    _format_scores,
    _to_spec,
)
from llm_benchmark.service.router._job_store import create_job, get_job, update_job
from llm_benchmark.settings import builtin_specs, validate_project_name

evaluate_router = APIRouter()


def _serialize_run(spec: ModelSpec, project_runs: dict[str, Any]) -> dict[str, Any]:
    """Build the per-model API payload from a {project: ModelRun} dict."""
    projects_payload: dict[str, Any] = {}
    for proj, run in project_runs.items():
        entry: dict[str, Any] = {"status": run.status.value}
        if run.status == RunStatus.OK:
            entry["scores"] = _format_scores(run.score)
            entry["performance"] = run.perf or {}
            entry["performance_display"] = _format_perf(run.perf or {})
            entry["results"] = run.result or {}

        elif run.status == RunStatus.ERROR:
            entry["error"] = run.error or ""

        elif run.status == RunStatus.SKIPPED:
            entry["reason"] = run.reason or ""

        projects_payload[proj] = entry

    return {"spec": spec.to_info(), "projects": projects_payload}


def _run_evaluate_job(job_id: str, body: EvaluateRequest, app: Any) -> None:
    """Background worker — translate request, invoke runner, persist response."""
    update_job(job_id, status="running")

    def _progress(stage: str, completed: int, total: int) -> None:
        update_job(
            job_id,
            stage=stage,
            progress={"completed": completed, "total": total},
        )

    try:
        specs = [_to_spec(m) for m in body.models]

        runner = get_shared_object(app, "runner")

        _builtin_map = builtin_specs()
        specs = [_builtin_map[s.id] if s.kind == ModelKind.BUILTIN and s.id in _builtin_map else s for s in specs]

        outcomes = runner.evaluate(
            projects=body.projects,
            models=specs,
            progress_callback=_progress,
            metric_overrides=body.metric_overrides,
        )

        specs_by_id = {s.id: s for s in specs}
        results_payload: dict[str, Any] = {}
        for mid, project_runs in outcomes.items():
            spec = specs_by_id.get(mid)
            if spec is None:
                continue
            results_payload[mid] = _serialize_run(spec, project_runs)

        update_job(
            job_id,
            status="done",
            result={
                "success": True,
                "schema_version": SCHEMA_VERSION,
                "results": results_payload,
                "project_errors": {},
            },
        )

    except Exception as exc:
        logger.error("Evaluate job failed job_id=%s: %s", job_id, exc, exc_info=True)
        update_job(job_id, status="error", error=str(exc))


@evaluate_router.post("/evaluate", summary="提交模型評估任務(非同步)", status_code=202)
async def evaluate(request: Request, body: EvaluateRequest) -> JSONResponse:
    try:
        for project in body.projects:
            validate_project_name(project)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    job_id = create_job()
    thread = threading.Thread(
        target=_run_evaluate_job,
        args=(job_id, body, request.app),
        daemon=True,
        name=f"evaluate-{job_id[:8]}",
    )
    thread.start()

    return JSONResponse({"job_id": job_id}, status_code=202)


@evaluate_router.get("/evaluate/status/{job_id}", summary="查詢評估任務狀態")
async def evaluate_status(job_id: str) -> JSONResponse:
    job = get_job(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")

    return JSONResponse(
        {
            "job_id": job_id,
            "status": job["status"],
            "created_at": job.get("created_at"),
            "error": job.get("error"),
            "stage": job.get("stage"),
            "progress": job.get("progress"),
        }
    )


@evaluate_router.get("/evaluate/result/{job_id}", summary="取得評估任務結果")
async def evaluate_result(job_id: str) -> JSONResponse:
    job = get_job(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")

    if job["status"] == "error":
        raise HTTPException(status_code=500, detail=job.get("error", "Evaluation failed"))

    if job["status"] != "done":
        raise HTTPException(status_code=409, detail=f"Job not finished yet (status={job['status']})")

    sanitized = json.loads(
        json.dumps(job["result"], allow_nan=True)
        .replace("-Infinity", "null")
        .replace("Infinity", "null")
        .replace("NaN", "null")
    )
    return JSONResponse(sanitized)
