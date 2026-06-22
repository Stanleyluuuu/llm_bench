"""Unit tests for llm_benchmark.adapters (FU-2 + general adapter behaviour)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from llm_benchmark.adapters import CustomAPIAdapter
from llm_benchmark.samples import Sample


def _make_response(text: str = "ok") -> MagicMock:
    resp = MagicMock()
    resp.text = text
    return resp


def test_custom_api_adapter_default_timeout_is_60s():
    adapter = CustomAPIAdapter("https://x", api_param={"employee_id": "e", "question": "q"})
    assert adapter.request_timeout == 60


def test_custom_api_adapter_honours_explicit_timeout():
    adapter = CustomAPIAdapter(
        "https://x",
        api_param={"employee_id": "e", "question": "q"},
        request_timeout=7,
    )
    assert adapter.request_timeout == 7


def test_custom_api_adapter_passes_timeout_to_requests_post():
    adapter = CustomAPIAdapter(
        "https://x",
        api_param={"employee_id": "e", "question": "q"},
        request_timeout=13,
    )
    with patch("llm_benchmark.adapters.custom_api.requests.post", return_value=_make_response("a")) as mock_post:
        adapter.invoke(Sample(question="hi", ground_truth="g"))
    mock_post.assert_called_once()
    _, kwargs = mock_post.call_args
    assert kwargs.get("timeout") == 13


def test_custom_api_adapter_default_timeout_reaches_requests_post():
    adapter = CustomAPIAdapter(
        "https://x",
        api_param={"employee_id": "e", "question": "q"},
    )
    with patch("llm_benchmark.adapters.custom_api.requests.post", return_value=_make_response("a")) as mock_post:
        adapter.invoke(Sample(question="hi", ground_truth="g"))
    _, kwargs = mock_post.call_args
    assert kwargs.get("timeout") == 60


def test_custom_api_adapter_zero_timeout_falls_back_to_default():
    """FU-2 regression guard: ``request_timeout=0`` must not mean "no timeout"."""
    adapter = CustomAPIAdapter(
        "https://x",
        api_param={"employee_id": "e", "question": "q"},
        request_timeout=0,
    )
    assert adapter.request_timeout == 60
