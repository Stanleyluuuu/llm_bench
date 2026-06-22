from llm_benchmark.settings.loader import (
    build_default_override_config,
    merge_override_config,
)

# ─── merge_override_config ────────────────────────────────────────────────


def test_merge_override_later_wins():
    settings_layer = {"modelName": "settings-model", "temperature": 0.5}
    project_layer = {"modelName": "project-model", "basepath": "https://p"}
    adapter_layer = {"modelName": "adapter-model"}
    merged = merge_override_config(settings_layer, project_layer, adapter_layer)
    assert merged["modelName"] == "adapter-model"  # adapter wins
    assert merged["basepath"] == "https://p"  # from project
    assert merged["temperature"] == 0.5  # from settings


def test_merge_override_deep_nested():
    settings_layer = {
        "llmModelConfig": {"modelName": "s-model", "maxTokens": 1000},
    }
    adapter_layer = {
        "llmModelConfig": {"modelName": "a-model", "basepath": "https://a"},
    }
    merged = merge_override_config(settings_layer, None, adapter_layer)
    assert merged["llmModelConfig"]["modelName"] == "a-model"
    assert merged["llmModelConfig"]["maxTokens"] == 1000
    assert merged["llmModelConfig"]["basepath"] == "https://a"


def test_merge_override_ignores_empty_layers():
    assert merge_override_config(None, {}, {"x": 1}) == {"x": 1}
    assert merge_override_config() == {}


def test_merge_override_does_not_mutate_inputs():
    a = {"nested": {"k": 1}}
    b = {"nested": {"k": 2}}
    merge_override_config(a, b)
    assert a == {"nested": {"k": 1}}
    assert b == {"nested": {"k": 2}}


# ─── build_default_override_config ────────────────────────────────────────


def test_build_default_override_config_shape():
    override = build_default_override_config("my-llm", "https://api.example.com")
    assert override["modelName"] == "my-llm"
    assert override["basepath"] == "https://api.example.com"
    assert override["llmModelConfig"]["modelName"] == "my-llm"
    assert override["llmModelConfig"]["basepath"] == "https://api.example.com"
    assert override["conditionAgentModelConfig"]["modelName"] == "my-llm"
    assert override["conditionAgentModelConfig"]["basepath"] == "https://api.example.com"
