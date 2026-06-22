from enum import Enum
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, Field, model_validator


class ModelKind(str, Enum):
    BUILTIN = "builtin"
    CUSTOM = "custom"


class ModelType(str, Enum):
    LLM = "LLM"
    VLM = "VLM"


class RunStatus(str, Enum):
    OK = "ok"
    ERROR = "error"
    SKIPPED = "skipped"


TaskType = Literal["LLM", "VLM"]
SourceType = Literal["flowise", "openai", "custom"]
MetricsValue = Literal["ragas", "llm", "OutputParser", "exact_match", "iou"]


class LLMConfig(BaseModel):
    api_base: str = ""
    name: str = ""
    max_token: int = 2048


class VLMConfig(BaseModel):
    api_base: str = ""
    name: str = ""
    max_token: int = 4096
    resize: tuple[int, int] | None = None
    model_space: Literal["absolute", "normalized", "resized"] = "absolute"


class EmbeddingConfig(BaseModel):
    url: str = ""
    name: str = ""
    dim: int = 1024


class FlowiseConfig(BaseModel):
    default_base_url: str = ""
    request_timeout: int = 120
    max_retries: int = 3
    retry_delay: float = 0.0
    verify_ssl: bool = True


class AppSettings(BaseModel):
    llm_large: LLMConfig = Field(default_factory=LLMConfig)
    llm_small: LLMConfig = Field(default_factory=LLMConfig)
    vlm_large: VLMConfig = Field(default_factory=VLMConfig)
    vlm_small: VLMConfig = Field(default_factory=VLMConfig)
    embedding: EmbeddingConfig = Field(default_factory=EmbeddingConfig)
    flowise: FlowiseConfig = Field(default_factory=FlowiseConfig)


class ModelSpec(BaseModel):
    """Caller-supplied identification of a model to run.

    For custom models, ``id`` is opaque (e.g. ``"custom:my-model-7b"``).
    """

    id: str
    kind: ModelKind
    model_type: ModelType
    display_name: str
    name: str
    api_base: str
    max_token: int = 100_000
    resize: tuple[int, int] | None = None
    model_space: str = "absolute"

    def to_info(self) -> dict[str, Any]:
        """Serialise to a JSON-safe dict (used in API responses + saved files)."""
        return {
            "id": self.id,
            "kind": self.kind.value,
            "model_type": self.model_type.value,
            "display_name": self.display_name,
            "name": self.name,
            "api_base": self.api_base,
            "max_token": self.max_token,
            "resize": list(self.resize) if self.resize else None,
            "model_space": self.model_space,
        }

    def to_public_info(self) -> dict[str, Any]:
        """Serialise for public API responses — omits api_base for builtins."""
        info = self.to_info()
        if self.kind == ModelKind.BUILTIN:
            info.pop("api_base", None)

        return info


class ModelRun(BaseModel):
    """Per-(project, model) outcome."""

    status: RunStatus
    score: dict[str, Any] | None = None
    perf: dict[str, Any] | None = None
    result: dict[str, Any] | None = None
    error: str | None = None
    reason: str | None = None

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"status": self.status.value}
        if self.score is not None:
            out["scores"] = self.score
        if self.perf is not None:
            out["performance"] = self.perf
        if self.result is not None:
            out["results"] = self.result
        if self.error is not None:
            out["error"] = self.error
        if self.reason is not None:
            out["reason"] = self.reason

        return out


class TaskConfig(BaseModel):
    """Validated representation of a single project's ``config.yaml``.

    Canonical shape (lowercase top-level keys):

    - ``type``: ``"LLM"`` or ``"VLM"`` (enum-style values stay uppercase).
    - ``metrics``: one of ``"ragas"`` / ``"llm"`` / ``"OutputParser"`` /
      ``"exact_match"`` / ``"iou"``.
      ``"OutputParser"`` is only allowed when ``source == "flowise"``.
    - ``source``: ``"flowise"`` / ``"openai"`` / ``"custom"``.
    - ``inference_params``: free-form ``dict[str, Any]`` consumed by the
      adapter or scoring layer for the matching ``source``. Pydantic does
      **not** validate the inner shape — projects extend it freely.
    """

    type: TaskType
    metrics: MetricsValue
    source: SourceType
    inference_params: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def _check_outputparser_only_in_flowise(self) -> "TaskConfig":
        if self.metrics == "OutputParser" and self.source != "flowise":
            raise ValueError(
                f"metrics='OutputParser' is only allowed when source='flowise' (got source={self.source!r})"
            )

        return self

    @classmethod
    def from_yaml(cls, path: str | Path) -> "TaskConfig":
        """Read a project ``config.yaml`` and validate it as a :class:`TaskConfig`.

        Raises :class:`pydantic.ValidationError` on schema mismatch and
        :class:`yaml.YAMLError` on malformed YAML.
        """
        yaml_path = Path(path)
        with open(yaml_path, encoding="utf-8") as fh:
            raw = yaml.safe_load(fh) or {}

        return cls.model_validate(raw)


class ModelIn(BaseModel):
    """One entry in :class:`EvaluateRequest.models` — builtin or custom."""

    id: str
    kind: Literal["builtin", "custom"]
    model_type: Literal["LLM", "VLM"]
    display_name: str
    name: str
    api_base: str = ""
    max_token: int = 100_000
    resize: list[int] | None = None


class MetricOverrides(BaseModel):
    use_ragas: bool = False
    # Which scoring backend to use for LLM-judge / ragas metrics.
    # "custom"  → hand-written LLMJudgementService / ragas pipeline (default)
    # "deepeval" → DeepEval-based implementations (for comparison)
    engine: Literal["custom", "deepeval"] = "custom"


class EvaluateRequest(BaseModel):
    projects: list[str]
    models: list[ModelIn] = Field(default_factory=list)
    metric_overrides: MetricOverrides | None = None


class ValidateRequest(BaseModel):
    base_url: str


def filter_by_project_type(
    specs_by_id: dict[str, ModelSpec], project_type: str, source: str = ""
) -> tuple[list[ModelSpec], list[ModelSpec]]:
    """
    Split models into (compatible, incompatible) per project type.

    Rules:
    - VLM project → only VLM models are compatible.
    - LLM project + flowise source → only LLM models are compatible.
    - LLM project + openai/custom source → both LLM and VLM models are compatible.
    """
    models = list(specs_by_id.values())
    if project_type == "VLM":
        compatible = [m for m in models if m.model_type == ModelType.VLM]
        incompatible = [m for m in models if m.model_type != ModelType.VLM]
    elif project_type == "LLM":
        compatible = list(models)
        incompatible = []
    else:
        return [], list(models)

    return compatible, incompatible
