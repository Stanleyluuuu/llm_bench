import os.path
import re
from pathlib import Path
from typing import Any

from dynaconf import Dynaconf

from llm_benchmark.schema import (
    AppSettings,
    EmbeddingConfig,
    FlowiseConfig,
    LLMConfig,
    ModelKind,
    ModelSpec,
    ModelType,
    VLMConfig,
)

env = Dynaconf(
    envvar_prefix="LLM_BENCHMARK",
    env_switcher="LLM_BENCHMARK_ENV",
    settings_files=["settings.yaml", "secrets.yaml"],
    environments=True,
    root_path=os.path.dirname(__file__),
)


def _load_app_settings() -> AppSettings:
    providers: dict[str, Any] = env["providers"].to_dict()
    flowise_raw: dict[str, Any] = env["flowise"].to_dict()

    return AppSettings(
        llm_large=LLMConfig(**(providers.get("llm_large"))),
        llm_small=LLMConfig(**(providers.get("llm_small"))),
        vlm_large=VLMConfig(**(providers.get("vlm_large"))),
        vlm_small=VLMConfig(**(providers.get("vlm_small"))),
        embedding=EmbeddingConfig(**(providers.get("embedding"))),
        flowise=FlowiseConfig(**flowise_raw),
    )


app_settings = _load_app_settings()


_REPO_ROOT: Path = Path(__file__).parent.parent.parent
PROJECTS_DIR: Path = _REPO_ROOT / "dataset"


_HISTORY_FILENAME_RE = re.compile(r"^evaluation_[A-Za-z0-9_\-]+\.json$")
_RUN_ID_RE = re.compile(r"^[0-9]{8}T[0-9]{6}$")
_FORBIDDEN_PROJECT_SUBSTRINGS: tuple[str, ...] = ("..", "/", "\\", "\x00")


def builtin_specs() -> dict[str, ModelSpec]:
    """Return the four builtin ModelSpec instances derived from app_settings."""
    return {
        "llm_large": ModelSpec(
            id="llm_large",
            kind=ModelKind.BUILTIN,
            model_type=ModelType.LLM,
            display_name="LLM Large",
            name=app_settings.llm_large.name,
            api_base=app_settings.llm_large.api_base,
            max_token=app_settings.llm_large.max_token,
        ),
        "llm_small": ModelSpec(
            id="llm_small",
            kind=ModelKind.BUILTIN,
            model_type=ModelType.LLM,
            display_name="LLM Small",
            name=app_settings.llm_small.name,
            api_base=app_settings.llm_small.api_base,
            max_token=app_settings.llm_small.max_token,
        ),
        "vlm_large": ModelSpec(
            id="vlm_large",
            kind=ModelKind.BUILTIN,
            model_type=ModelType.VLM,
            display_name="VLM Large",
            name=app_settings.vlm_large.name,
            api_base=app_settings.vlm_large.api_base,
            max_token=app_settings.vlm_large.max_token,
            resize=app_settings.vlm_large.resize,
            model_space=app_settings.vlm_large.model_space,
        ),
        "vlm_small": ModelSpec(
            id="vlm_small",
            kind=ModelKind.BUILTIN,
            model_type=ModelType.VLM,
            display_name="VLM Small",
            name=app_settings.vlm_small.name,
            api_base=app_settings.vlm_small.api_base,
            max_token=app_settings.vlm_small.max_token,
            resize=app_settings.vlm_small.resize,
            model_space=app_settings.vlm_small.model_space,
        ),
    }


def list_projects() -> set[str]:
    """Return the set of existing project directory names under PROJECTS_DIR."""
    if not PROJECTS_DIR.exists():
        return set()

    return {item.name for item in PROJECTS_DIR.iterdir() if item.is_dir()}


def validate_project_name(name: Any) -> str:
    """Validate ``name`` as a known project and return it unchanged."""
    if not isinstance(name, str) or not name:
        raise ValueError("Project name must be a non-empty string")
    for bad in _FORBIDDEN_PROJECT_SUBSTRINGS:
        if bad in name:
            raise ValueError(f"Invalid project name: contains forbidden substring {bad!r}")
    if name not in list_projects():
        raise ValueError(f"Unknown project: {name!r}")

    return name


def validate_history_filename(name: Any) -> str:
    """Validate ``name`` as a safe history filename under a project's output dir."""
    if not isinstance(name, str) or not name:
        raise ValueError("Filename must be a non-empty string")
    if any(bad in name for bad in ("/", "\\", "..", "\x00")):
        raise ValueError("Invalid filename: contains path separator or '..'")
    if not _HISTORY_FILENAME_RE.match(name):
        raise ValueError(f"Invalid filename: {name!r} (expected evaluation_<ts>.json)")

    return name


def validate_run_id(run_id: Any) -> str:
    """Validate ``run_id`` as a safe history run identifier (``YYYYMMDDTHHMMSS``)."""
    if not isinstance(run_id, str) or not run_id:
        raise ValueError("Run id must be a non-empty string")
    if not _RUN_ID_RE.match(run_id):
        raise ValueError(f"Invalid run_id: {run_id!r} (expected YYYYMMDDTHHMMSS)")

    return run_id
