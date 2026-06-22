"""Pydantic schema for the run-based history layer.

Single source of truth for ``RunFile`` and ``manifest.json`` shapes. Modality
(LLM vs VLM) only surfaces through ``CaseInput.type`` / ``CaseInput.images``;
all downstream code (storage, cleanup, series, frontend) treats both modalities
identically.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

HISTORY_SCHEMA_VERSION = 1

TaskTypeLiteral = Literal["text_gen", "vlm_detection"]
InputTypeLiteral = Literal["text", "multimodal"]
VerdictOutcome = Literal["single_winner", "tie", "all_pass"]

# Defence-in-depth: reject anything that looks like inline base64 image data.
_MAX_IMAGE_REF_LEN = 4096


class CaseInput(BaseModel):
    """Per-case input. ``images`` holds disk paths or content hashes — NEVER base64."""

    type: InputTypeLiteral
    prompt: str
    images: list[str] = Field(default_factory=list)

    @field_validator("images")
    @classmethod
    def _reject_inline_base64(cls, v: list[str]) -> list[str]:
        for ref in v:
            if not isinstance(ref, str):
                raise ValueError(f"image reference must be str, got {type(ref).__name__}")
            if ref.startswith("data:") or len(ref) > _MAX_IMAGE_REF_LEN:
                raise ValueError(
                    f"image references must be paths or hashes, not inline base64 (len={len(ref)}, head={ref[:32]!r})"
                )
        return v


class ModelOutput(BaseModel):
    """One model's response for a single case. ``score`` carries LLM judge avg or VLM IoU."""

    answer: str
    score: float | None = None
    latency_ms: int | None = None


class Verdict(BaseModel):
    outcome: VerdictOutcome
    winner_model_ids: list[str] = Field(default_factory=list)
    rationale: str = ""


class CaseResult(BaseModel):
    case_id: str
    input: CaseInput
    ground_truth: str
    model_outputs: dict[str, ModelOutput] = Field(default_factory=dict)
    verdict: Verdict


class ModelSummary(BaseModel):
    """Aggregated per-model metrics for one run.

    Modality-specific fields stay optional so a single shape covers LLM and VLM.
    """

    w: int = 0
    t: int = 0
    losses: int = 0
    avg_score: float | None = None  # LLM-judge mean
    pass_rate: float | None = None  # VLM: IoU >= threshold ratio
    mean_iou: float | None = None  # VLM
    threshold: float | None = None  # VLM


class RunMetadata(BaseModel):
    """Lightweight manifest entry — frontend can list runs without loading full snapshots."""

    run_id: str
    timestamp: str
    task_type: TaskTypeLiteral
    models: list[str]
    judge: str
    summary: dict[str, ModelSummary] = Field(default_factory=dict)
    file: str


class Manifest(BaseModel):
    task: str
    schema_version: int = HISTORY_SCHEMA_VERSION
    runs: list[RunMetadata] = Field(default_factory=list)


class RunFile(BaseModel):
    """Full per-run snapshot. One file per run under ``runs/{run_id}_run.json``."""

    run_id: str
    timestamp: str
    task: str
    task_type: TaskTypeLiteral
    schema_version: int = HISTORY_SCHEMA_VERSION
    models: list[str]
    judge: str
    cases: list[CaseResult] = Field(default_factory=list)
    summary: dict[str, ModelSummary] = Field(default_factory=dict)
