from typing import Any

from llm_benchmark.settings.base import env


def _as_plain(value: Any) -> Any:
    """Convert DynaBox/Box nested structures to plain dicts/lists."""
    if hasattr(value, "to_dict"):
        return value.to_dict()
    if isinstance(value, dict):
        return {k: _as_plain(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_as_plain(v) for v in value]

    return value


def get_providers() -> dict[str, Any]:
    """Return the `providers` block from settings as a plain dict."""
    raw = env.get("providers", {}) or {}

    return _as_plain(raw)


def get_flowise_defaults() -> dict[str, Any]:
    """Return the `flowise` block (default_base_url, default_override_config)."""
    raw = env.get("flowise", {}) or {}
    defaults = _as_plain(raw)
    defaults.setdefault("default_base_url", "")
    defaults.setdefault("default_override_config", {})

    return defaults
