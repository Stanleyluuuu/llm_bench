from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from llm_benchmark.history import (
    cleanup_outdated_runs,
    read_manifest,
    read_run,
    write_manifest,
)
from llm_benchmark.history.schema import HISTORY_SCHEMA_VERSION
from llm_benchmark.history.storage import RUNS_SUBDIR
from llm_benchmark.settings import PROJECTS_DIR, validate_project_name, validate_run_id

runs_router = APIRouter()


def _output_dir(project: str) -> object:  # Path; quoted to avoid stray import in API doc
    from pathlib import Path

    return Path(PROJECTS_DIR) / project / "output"


@runs_router.get(
    "/projects/{project}/runs",
    summary="取得專案的 run-based 歷史紀錄索引(manifest)",
)
async def list_runs(project: str) -> JSONResponse:
    try:
        project = validate_project_name(project)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    task_dir = _output_dir(project)
    if task_dir.exists():
        cleanup_outdated_runs(task_dir)
    manifest = read_manifest(task_dir)
    return JSONResponse(
        {
            "task": manifest.task or project,
            "schema_version": HISTORY_SCHEMA_VERSION,
            "runs": [r.model_dump(mode="json") for r in manifest.runs],
        }
    )


@runs_router.get(
    "/projects/{project}/runs/{run_id}",
    summary="取得單一 run 的完整快照",
)
async def get_run_detail(project: str, run_id: str) -> JSONResponse:
    try:
        project = validate_project_name(project)
        run_id = validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    task_dir = _output_dir(project)
    if task_dir.exists():
        cleanup_outdated_runs(task_dir)
    run = read_run(task_dir, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Run not found: {run_id}")
    return JSONResponse(run.model_dump(mode="json"))


@runs_router.delete(
    "/projects/{project}/runs/{run_id}",
    summary="刪除單一 run（JSON 檔 + manifest 條目）",
)
async def delete_run(project: str, run_id: str) -> JSONResponse:
    try:
        project = validate_project_name(project)
        run_id = validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    task_dir = _output_dir(project)
    run_file = task_dir / RUNS_SUBDIR / f"{run_id}_run.json"

    if not run_file.exists():
        raise HTTPException(status_code=404, detail=f"Run not found: {run_id}")

    # 1. Delete the run JSON file.
    run_file.unlink()

    # 2. Remove the entry from the manifest and persist.
    manifest = read_manifest(task_dir)
    manifest.runs = [r for r in manifest.runs if r.run_id != run_id]
    write_manifest(task_dir, manifest)

    return JSONResponse({"deleted": run_id})
