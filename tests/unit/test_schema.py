"""Tests for the consolidated :mod:`llm_benchmark.schema` Pydantic entry point."""

from __future__ import annotations

import pytest

from llm_benchmark.schema import (
    AppSettings,
    EmbeddingConfig,
    EvaluateRequest,
    FlowiseConfig,
    LLMConfig,
    ModelIn,
    ModelKind,
    ModelRun,
    ModelSpec,
    ModelType,
    RunStatus,
    TaskConfig,
    ValidateRequest,
    VLMConfig,
)

# ─── ModelSpec ────────────────────────────────────────────────────────────────


def test_model_spec_to_info_roundtrip():
    spec = ModelSpec(
        id="vlm_large",
        kind=ModelKind.BUILTIN,
        model_type=ModelType.VLM,
        display_name="VLM L",
        name="qwen2-vl",
        api_base="http://x",
        max_token=2048,
        resize=(800, 600),
    )
    info = spec.to_info()
    assert info["id"] == "vlm_large"
    assert info["kind"] == "builtin"
    assert info["model_type"] == "VLM"
    assert info["resize"] == [800, 600]
    assert info["api_base"] == "http://x"


def test_model_spec_to_public_info_omits_api_base_for_builtins():
    spec = ModelSpec(
        id="llm_small",
        kind=ModelKind.BUILTIN,
        model_type=ModelType.LLM,
        display_name="LLM S",
        name="qwen2",
        api_base="http://internal",
    )
    pub = spec.to_public_info()
    assert "api_base" not in pub


def test_model_spec_to_public_info_keeps_api_base_for_custom():
    spec = ModelSpec(
        id="custom:foo",
        kind=ModelKind.CUSTOM,
        model_type=ModelType.LLM,
        display_name="Foo",
        name="foo",
        api_base="http://user-supplied",
    )
    assert spec.to_public_info()["api_base"] == "http://user-supplied"


# ─── ModelRun ─────────────────────────────────────────────────────────────────


def test_model_run_to_dict_skips_none():
    run = ModelRun(status=RunStatus.OK, score={"a": 1.0}, perf={"avg": 0.5})
    d = run.to_dict()
    assert d["status"] == "ok"
    assert d["scores"] == {"a": 1.0}
    assert d["performance"] == {"avg": 0.5}
    assert "results" not in d
    assert "error" not in d
    assert "reason" not in d


def test_model_run_error_status():
    run = ModelRun(status=RunStatus.ERROR, error="boom")
    d = run.to_dict()
    assert d == {"status": "error", "error": "boom"}


# ─── AppSettings & sub-models ─────────────────────────────────────────────────


def test_app_settings_defaults():
    s = AppSettings()
    assert isinstance(s.llm_large, LLMConfig)
    assert isinstance(s.vlm_large, VLMConfig)
    assert isinstance(s.embedding, EmbeddingConfig)
    assert isinstance(s.flowise, FlowiseConfig)


def test_app_settings_from_dicts():
    s = AppSettings(
        llm_large={"api_base": "http://a", "name": "n", "max_token": 1024},
        vlm_large={"api_base": "http://b", "name": "v", "max_token": 4096, "resize": (640, 480)},
    )
    assert s.llm_large.api_base == "http://a"
    assert s.vlm_large.resize == (640, 480)


# ─── TaskConfig ───────────────────────────────────────────────────────────────


def test_taskconfig_vlm_openai_minimal():
    cfg = TaskConfig(
        type="VLM",
        metrics="ragas",
        source="openai",
        inference_params={"user_prompt": "describe"},
    )
    assert cfg.type == "VLM"
    assert cfg.source == "openai"
    assert cfg.inference_params["user_prompt"] == "describe"


def test_taskconfig_outputparser_only_in_flowise():
    # OutputParser permitted with flowise source.
    ok = TaskConfig(
        type="LLM",
        metrics="OutputParser",
        source="flowise",
        inference_params={
            "base_url": "https://x",
            "flow_id": "abc",
            "outputparser_key": {"Winner": "GROUND_TRUTH"},
        },
    )
    assert ok.metrics == "OutputParser"
    # And rejected for non-flowise sources.
    with pytest.raises(ValueError, match="OutputParser"):
        TaskConfig(
            type="LLM",
            metrics="OutputParser",
            source="openai",
        )


def test_taskconfig_inference_params_defaults_to_empty_dict():
    cfg = TaskConfig(type="LLM", metrics="llm", source="openai")
    assert cfg.inference_params == {}


def test_taskconfig_invalid_source_rejected():
    with pytest.raises(ValueError):
        TaskConfig(type="LLM", metrics="ragas", source="bogus")  # type: ignore[arg-type]


def test_taskconfig_from_yaml(tmp_path):
    import yaml as _yaml

    p = tmp_path / "config.yaml"
    p.write_text(
        _yaml.safe_dump(
            {
                "type": "LLM",
                "metrics": "llm",
                "source": "custom",
                "inference_params": {
                    "api_new": "https://api/new",
                    "streaming": True,
                },
            }
        ),
        encoding="utf-8",
    )
    cfg = TaskConfig.from_yaml(p)
    assert cfg.type == "LLM"
    assert cfg.source == "custom"
    assert cfg.inference_params["api_new"] == "https://api/new"
    assert cfg.inference_params["streaming"] is True


# ─── API DTOs ─────────────────────────────────────────────────────────────────


def test_evaluate_request_accepts_mixed_models():
    req = EvaluateRequest(
        projects=["P1"],
        models=[
            {
                "id": "llm_large",
                "kind": "builtin",
                "model_type": "LLM",
                "display_name": "LLM L",
                "name": "n",
                "api_base": "http://x",
            },
            {
                "id": "custom:m",
                "kind": "custom",
                "model_type": "VLM",
                "display_name": "Custom",
                "name": "m",
                "api_base": "http://y",
                "resize": [640, 480],
            },
        ],
    )
    assert req.models[0].kind == "builtin"
    assert req.models[1].resize == [640, 480]


def test_validate_request_minimal():
    v = ValidateRequest(base_url="http://x")
    assert v.base_url == "http://x"


def test_model_in_rejects_invalid_kind():
    with pytest.raises(ValueError):
        ModelIn(
            id="x",
            kind="bogus",  # type: ignore[arg-type]
            model_type="LLM",
            display_name="x",
            name="x",
            api_base="http://x",
        )


# ─── Re-export shims ──────────────────────────────────────────────────────────


def test_runner_types_reexport():
    from llm_benchmark.schema import ModelSpec as RT_ModelSpec

    assert RT_ModelSpec is ModelSpec


def test_settings_reexport():
    from llm_benchmark.settings import LLMConfig as S_LLMConfig

    assert S_LLMConfig is LLMConfig
