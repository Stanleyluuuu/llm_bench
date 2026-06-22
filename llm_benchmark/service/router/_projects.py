import yaml
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from llm_benchmark.service.router._helpers import SCHEMA_VERSION
from llm_benchmark.settings import PROJECTS_DIR, builtin_specs, validate_project_name

projects_router = APIRouter()


@projects_router.get("/projects", summary="取得所有專案列表")
async def get_projects() -> JSONResponse:
    projects: list[dict[str, str | float | None]] = []
    if PROJECTS_DIR.exists():
        for item in sorted(PROJECTS_DIR.iterdir()):
            if not item.is_dir():
                continue
            project_type = "LLM"
            config_path = item / "config.yaml"
            meta: dict[str, str | float | None] = {
                "project": None,
                "capability": None,
                "description": None,
                "estimated_minutes": None,
            }
            if config_path.exists():
                with open(config_path, encoding="utf-8") as f:
                    config = yaml.safe_load(f) or {}
                raw_type = (config.get("type") or "LLM").strip()
                project_type = "VLM" if raw_type == "VLM" else "LLM"
                raw_meta = config.get("metadata") or {}
                for key in ("project", "capability", "description"):
                    val = raw_meta.get(key)
                    meta[key] = str(val) if val and str(val) != "TODO" else None
                raw_est = raw_meta.get("estimated_minutes")
                try:
                    meta["estimated_minutes"] = float(raw_est) if raw_est is not None else None
                except (TypeError, ValueError):
                    meta["estimated_minutes"] = None
            projects.append({"name": item.name, "type": project_type, **meta})

    return JSONResponse({"projects": projects})


@projects_router.get("/config", summary="取得內建模型設定")
async def get_config() -> JSONResponse:
    """Return the four startup-pool builtin model specs (for frontend chips)."""
    specs = builtin_specs()

    return JSONResponse(
        {
            "schema_version": SCHEMA_VERSION,
            "builtins": [spec.to_public_info() for spec in specs.values()],
        }
    )


@projects_router.get("/projects/{project_name}/images/{image_path:path}", summary="取得專案資料集圖片")
async def get_project_image(project_name: str, image_path: str) -> FileResponse:
    """Serve a dataset image for the given project with path traversal protection."""
    try:
        validate_project_name(project_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    base = (PROJECTS_DIR / project_name / "dataset").resolve()
    target = (base / image_path).resolve()

    if not target.is_relative_to(base):
        raise HTTPException(status_code=400, detail="Invalid image path")

    if not target.is_file():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(str(target))


@projects_router.get("/projects/{project_name}/prompts", summary="取得專案 Prompt 設定")
async def get_project_prompts(project_name: str) -> JSONResponse:
    """Return system_prompt and user_prompt_template from a project's config.yaml."""
    try:
        validate_project_name(project_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    config_path = PROJECTS_DIR / project_name / "config.yaml"
    if not config_path.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    with open(config_path, encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}

    inference_params = config.get("inference_params") or {}
    system_prompt = inference_params.get("system_prompt")
    user_prompt = inference_params.get("user_prompt")

    return JSONResponse(
        {
            "system_prompt": str(system_prompt) if system_prompt else None,
            "user_prompt_template": str(user_prompt) if user_prompt else None,
            "source": config.get("source", "openai"),
        }
    )
