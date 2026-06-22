import copy
from typing import Any


class ConfigError(ValueError):
    """Raised when project-config-related composition fails."""


def merge_override_config(*layers: dict[str, Any] | None) -> dict[str, Any]:
    """Deep-merge override_config layers (later layers win).

    Used at call time to combine:
      1. settings.yaml flowise.default_override_config
      2. Project config inference_params.override_config / judge_override_config
      3. Adapter runtime injection (modelName / basepath / nested model configs)
    """
    result: dict[str, Any] = {}
    for layer in layers:
        if not layer:
            continue
        _deep_merge(result, layer)

    return result


def _deep_merge(dst: dict[str, Any], src: dict[str, Any]) -> None:
    for k, v in src.items():
        if k in dst and isinstance(dst[k], dict) and isinstance(v, dict):
            _deep_merge(dst[k], v)
        else:
            dst[k] = copy.deepcopy(v)


def build_default_override_config(llm_name: str, llm_api_base: str) -> dict[str, Any]:
    """Return the canonical Flowise ``overrideConfig`` shape used as the adapter
    runtime layer in ``merge_override_config(settings, project, adapter)``.
    """
    return {
        "modelName": llm_name,
        "basepath": llm_api_base,
        "llmModelConfig": {"modelName": llm_name, "basepath": llm_api_base},
        "conditionAgentModelConfig": {"modelName": llm_name, "basepath": llm_api_base},
    }
