"""Smoke tests for the settings facade.

We do not mock dynaconf here — the `test` env in secrets.yaml supplies
deterministic values so these pass without requiring real credentials.
"""

from __future__ import annotations

from llm_benchmark.settings.facade import (
    get_flowise_defaults,
    get_providers,
)


def test_providers_block_populated():
    providers = get_providers()
    assert "llm_large" in providers
    assert providers["llm_large"]["name"]
    assert providers["llm_large"]["api_base"].startswith("https://")


def test_flowise_defaults_has_base_url_and_override():
    fw = get_flowise_defaults()
    assert "default_base_url" in fw
    assert "default_override_config" in fw
    assert isinstance(fw["default_override_config"], dict)
