"""Tests for Phase-9 three-layer judge override_config merge + hard-cut wiring."""

from __future__ import annotations

from unittest.mock import patch

from llm_benchmark.settings import (
    build_default_override_config,
    merge_override_config,
)


def test_build_default_override_config_shape():
    out = build_default_override_config("LLM-X", "https://x/v1")
    assert out["modelName"] == "LLM-X"
    assert out["basepath"] == "https://x/v1"
    assert out["llmModelConfig"] == {"modelName": "LLM-X", "basepath": "https://x/v1"}
    assert out["conditionAgentModelConfig"] == {
        "modelName": "LLM-X",
        "basepath": "https://x/v1",
    }


def test_merge_override_config_adapter_wins_over_settings_and_project():
    settings_default = {
        "modelName": "FromSettings",
        "temperature": 0.0,
        "llmModelConfig": {"modelName": "FromSettings", "topP": 0.1},
    }
    project = {
        "modelName": "FromProject",
        "llmModelConfig": {"topP": 0.9},
        "projectSpecific": "yes",
    }
    adapter = build_default_override_config("FromAdapter", "https://adapter/v1")

    merged = merge_override_config(settings_default, project, adapter)

    # Adapter layer wins on modelName/basepath
    assert merged["modelName"] == "FromAdapter"
    assert merged["basepath"] == "https://adapter/v1"
    # Settings scalars survive where not overridden
    assert merged["temperature"] == 0.0
    # Project-only keys survive
    assert merged["projectSpecific"] == "yes"
    # Deep merge inside llmModelConfig: project `topP` kept, adapter `modelName` overrides
    assert merged["llmModelConfig"]["topP"] == 0.9
    assert merged["llmModelConfig"]["modelName"] == "FromAdapter"
    assert merged["llmModelConfig"]["basepath"] == "https://adapter/v1"


def test_merge_override_config_empty_settings_falls_back_to_project_and_adapter():
    project = {"llmModelConfig": {"temperature": 0.2}}
    adapter = build_default_override_config("M", "https://m/v1")
    merged = merge_override_config({}, project, adapter)
    assert merged["llmModelConfig"]["temperature"] == 0.2
    assert merged["llmModelConfig"]["modelName"] == "M"


def test_flowise_defaults_override_config_is_dict():
    """get_flowise_defaults always returns a dict for default_override_config."""
    from llm_benchmark.settings import get_flowise_defaults

    out = get_flowise_defaults()
    assert isinstance(out.get("default_override_config"), dict)


def test_compare_models_calls_evaluate_per_sample():
    """compare_models must call evaluate once per sample."""
    from llm_benchmark.metrics.llm_judgement import LLMJudgementService

    service = LLMJudgementService()
    call_count = 0

    def fake_evaluate(question, ground_truth, responses, **kwargs):
        nonlocal call_count
        call_count += 1
        return {"winner": None, "reason": None, "raw_response": {}}

    with patch.object(LLMJudgementService, "evaluate", side_effect=fake_evaluate):
        service.compare_models(
            questions=["q1", "q2"],
            ground_truths=["g1", "g2"],
            model_responses_list=[["a1", "a2"], ["b1", "b2"]],
            model_names=["A", "B"],
        )

    assert call_count == 2


def test_compare_models_single_model_aggregates_scores():
    """Single-model mode must aggregate avg_score across samples."""
    from llm_benchmark.metrics.llm_judgement import LLMJudgementService

    service = LLMJudgementService()

    def fake_evaluate(question, ground_truth, responses, **kwargs):
        return {
            "winner": None,
            "scores": {"accuracy": 4, "completeness": 4, "relevance_clarity": 4},
            "average_score": 4.0,
            "reason": None,
            "raw_response": {},
        }

    with patch.object(LLMJudgementService, "evaluate", side_effect=fake_evaluate):
        result = service.compare_models(
            questions=["q1", "q2"],
            ground_truths=["g1", "g2"],
            model_responses_list=[["a1", "a2"]],
            model_names=["A"],
        )

    assert result["summary"]["average_scores"]["average"] == 4.0
