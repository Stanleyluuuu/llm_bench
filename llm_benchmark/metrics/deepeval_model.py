"""Shared DeepEval model wrapper.

This module adapts the project's OpenAI-compatible inference endpoint (the same
one used by :class:`~llm_benchmark.adapters.llm_vlm.LLMVLMAdapter`) into a
``DeepEvalBaseLLM`` so that DeepEval metrics can run against the in-house LLM
gateway instead of OpenAI's public API.

It deliberately lives alongside the hand-written judge/ragas modules — it does
**not** replace them. Use it via the ``deepeval`` scoring engine to compare the
DeepEval-based results against the existing implementation.
"""

from __future__ import annotations

import json
import os
from typing import Any

from llm_benchmark.logging import logger
from llm_benchmark.settings import app_settings

try:  # DeepEval is an optional dependency (extra: ``deepeval``).
    from deepeval.models.base_model import DeepEvalBaseLLM

    _DEEPEVAL_AVAILABLE = True
except Exception:  # pragma: no cover - import guard
    DeepEvalBaseLLM = object  # type: ignore[assignment,misc]
    _DEEPEVAL_AVAILABLE = False


def deepeval_available() -> bool:
    """Return True when the ``deepeval`` package can be imported."""
    return _DEEPEVAL_AVAILABLE


class DeepEvalLLM(DeepEvalBaseLLM):  # type: ignore[misc]
    """Bridge DeepEval metrics to the project's OpenAI-compatible gateway.

    DeepEval calls :meth:`generate` / :meth:`a_generate` with an optional
    pydantic ``schema``. When a schema is supplied we ask the model for JSON and
    validate it, mirroring how DeepEval's native OpenAI integration enforces
    structured output.
    """

    def __init__(
        self,
        api_base: str | None = None,
        model_name: str | None = None,
        max_tokens: int | None = None,
    ) -> None:
        self.api_base = api_base or app_settings.llm_large.api_base
        self.model_name = model_name or app_settings.llm_large.name
        self.max_tokens = max_tokens or app_settings.llm_large.max_token
        self._client = None
        # Only forward to DeepEvalBaseLLM when the real base class is present;
        # otherwise the fallback is ``object`` whose __init__ takes no args.
        if _DEEPEVAL_AVAILABLE:
            super().__init__(self.model_name)

    # -- DeepEvalBaseLLM interface -------------------------------------------------
    def load_model(self) -> Any:
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI(
                base_url=self.api_base,
                api_key="EMPTY",
                max_retries=3,
                timeout=60.0,
                default_headers={"aiaas-apikey": os.getenv("AIAAS_APIKEY")},
            )
        return self._client

    def get_model_name(self) -> str:
        return f"DeepEval::{self.model_name}"

    def generate(self, prompt: str, schema: Any | None = None) -> Any:
        client = self.load_model()
        create_kwargs: dict[str, Any] = {
            "messages": [{"role": "user", "content": prompt}],
            "model": self.model_name,
            "max_completion_tokens": self.max_tokens,
            "temperature": 0,
        }
        if schema is not None:
            create_kwargs["response_format"] = {"type": "json_object"}

        completion = client.chat.completions.create(**create_kwargs)
        content = completion.choices[0].message.content or ""

        if schema is None:
            return content

        return self._coerce_schema(content, schema)

    async def a_generate(self, prompt: str, schema: Any | None = None) -> Any:
        # The gateway client is synchronous; run inline. DeepEval awaits this.
        return self.generate(prompt, schema)

    # -- helpers -------------------------------------------------------------------
    @staticmethod
    def _coerce_schema(content: str, schema: Any) -> Any:
        text = content.strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.lstrip().lower().startswith("json"):
                text = text.lstrip()[4:]
        try:
            data = json.loads(text)
            return schema(**data)
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("DeepEvalLLM schema coercion failed: %s (raw=%.200s)", exc, content)
            raise
