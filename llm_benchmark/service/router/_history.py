from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from llm_benchmark.logging import logger
from llm_benchmark.service.router._helpers import (
    SCHEMA_VERSION,
    _is_v2_payload,
    _load_json_with_nan,
)
from llm_benchmark.settings import (
    PROJECTS_DIR,
    validate_history_filename,
    validate_project_name,
)

history_router = APIRouter()


@history_router.get("/history/{project}", summary="取得專案評估歷史紀錄列表")
async def get_history(project: str) -> JSONResponse:
    try:
        project = validate_project_name(project)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    output_dir = PROJECTS_DIR / project / "output"
    if not output_dir.exists():
        return JSONResponse({"history": []})

    history: list[dict[str, Any]] = []
    for filepath in sorted(output_dir.glob("evaluation_*.json"), reverse=True):
        try:
            data = _load_json_with_nan(str(filepath))
            if not _is_v2_payload(data):
                logger.info("skip legacy history file %s (no schema_version=2)", filepath.name)
                continue

            models_payload = data.get("models", {})
            history.append(
                {
                    "filename": filepath.name,
                    "timestamp": data.get("timestamp"),
                    "datetime": data.get("datetime"),
                    "schema_version": SCHEMA_VERSION,
                    "summary": {
                        mid: {
                            "status": entry.get("status"),
                            "scores": entry.get("scores", {}),
                        }
                        for mid, entry in models_payload.items()
                    },
                }
            )
        except Exception as exc:
            logger.warning("Error reading %s: %s", filepath.name, exc)

    return JSONResponse({"history": history, "schema_version": SCHEMA_VERSION})


@history_router.get("/history/{project}/{filename}", summary="取得特定評估紀錄的詳細內容")
async def get_history_detail(project: str, filename: str) -> JSONResponse:
    try:
        project = validate_project_name(project)
        filename = validate_history_filename(filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    
    filepath = PROJECTS_DIR / project / "output" / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")

    data = _load_json_with_nan(str(filepath))
    if not _is_v2_payload(data):
        raise HTTPException(status_code=410, detail="legacy history file (schema_version != 2)")

    return JSONResponse(
        {
            "success": True,
            "schema_version": SCHEMA_VERSION,
            "timestamp": data.get("datetime"),
            "models": data.get("models", {}),
        }
    )
