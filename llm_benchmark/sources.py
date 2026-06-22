from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from .adapters import CustomAPIAdapter, FlowiseAdapter, LLMVLMAdapter
from .logging import logger
from .samples import Sample
from .schema import ModelSpec, TaskConfig
from .settings import (
    build_default_override_config,
    get_flowise_defaults,
    merge_override_config,
)


def run_source(project_config: TaskConfig, samples: list[Sample], selected: list[ModelSpec]) -> dict[str, dict]:
    """
    Dispatch inference to the correct adapter type and return per-model results.

    Raises:
        ValueError: if ``project_config.source`` is not one of 'openai', 'flowise', 'custom'.
    """
    if not selected or not samples:
        return {}

    source = project_config.source

    if source == "openai":
        return _run_openai(project_config, samples, selected)
    elif source == "flowise":
        return _run_flowise(project_config, samples, selected)
    elif source == "custom":
        return _run_custom(project_config, samples, selected)
    else:
        raise ValueError(f"Unknown source '{source}'. Expected one of: 'openai', 'flowise', 'custom'.")


def _run_openai(project_config: TaskConfig, samples: list[Sample], selected: list[ModelSpec]) -> dict[str, dict]:
    system_prompt = project_config.inference_params.get("system_prompt") or ""
    user_prompt = project_config.inference_params.get("user_prompt") or ""

    def _task(spec: ModelSpec) -> dict[str, list[Any]]:
        adapter = LLMVLMAdapter(
            api_base=spec.api_base,
            name=spec.name,
            max_token=spec.max_token,
        )
        try:
            result = adapter.run(samples, system_prompt=system_prompt, user_prompt=user_prompt)

            result["system_prompt"] = system_prompt
            result["user_prompt_template"] = user_prompt
            result["filled_user_prompts"] = [
                # VLM: mirrors _invoke_impl logic — fall back to question when no template
                (user_prompt if user_prompt else str(s.question))
                if s.image_path is not None
                # LLM: concatenate template + question, or just question when no template
                else (f"{user_prompt}\n{s.question}" if user_prompt else str(s.question))
                for s in samples
            ]

            result["messages"] = [
                [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": (
                            [
                                {"type": "text", "text": user_prompt or str(s.question)},
                                {"type": "image_url", "image_url": {"url": "[IMAGE_BASE64_OMITTED]"}},
                            ]
                            if s.image_path is not None
                            else (f"{user_prompt}\n{s.question}" if user_prompt else str(s.question))
                        ),
                    },
                ]
                for s in samples
            ]

            return result

        finally:
            adapter.close()

    return _collect_parallel(selected, _task)


def _run_flowise(project_config: TaskConfig, samples: list[Sample], selected: list[ModelSpec]) -> dict[str, dict]:
    params = project_config.inference_params

    base_url = str(params.get("base_url") or "")
    flow_id = str(params.get("flow_id") or "")
    form_input = bool(params.get("form_input", False))
    form_key = params.get("form_key") or {}

    flowise_defaults = get_flowise_defaults()
    request_timeout = int(flowise_defaults.get("request_timeout", 120) or 120)
    settings_override = flowise_defaults.get("default_override_config") or {}
    project_override = params.get("override_config") or {}

    def _task(spec: ModelSpec) -> dict[str, list[Any]]:
        adapter_layer = build_default_override_config(spec.name, spec.api_base)
        override = merge_override_config(settings_override, project_override, adapter_layer)
        adapter = FlowiseAdapter(
            base_url=base_url,
            flow_id=flow_id,
            model_name=spec.name,
            api_base=spec.api_base,
            request_timeout=request_timeout,
            form_input=form_input,
            form_key=form_key,
        )
        try:
            result = adapter.run(samples, override_config=override)
            # Flowise has no explicit prompt template; question IS the user input
            result["filled_user_prompts"] = [str(s.question) for s in samples]
            return result
        finally:
            adapter.close()

    return _collect_parallel(selected, _task)


def _run_custom(project_config: TaskConfig, samples: list[Sample], selected: list[ModelSpec]) -> dict[str, dict]:
    params = project_config.inference_params

    endpoint = params.get("api_new") or params.get("api_old")
    if not endpoint:
        return {spec.id: {} for spec in selected}

    api_param = params.get("api_param") or {}
    streaming = bool(params.get("streaming", False))
    timeout = params.get("api_timeout")

    def _task(spec: ModelSpec) -> dict[str, list[Any]]:
        adapter = CustomAPIAdapter(
            endpoint_url=str(endpoint),
            api_param=api_param,
            streaming=streaming,
            request_timeout=timeout if timeout else 60,
        )
        try:
            res = adapter.run(samples)
            # Custom API has no explicit prompt template; question IS the user input
            res["filled_user_prompts"] = [str(s.question) for s in samples]
            return res
        finally:
            adapter.close()

    return _collect_parallel(selected, _task)


def _collect_parallel(
    selected: list[ModelSpec], task_fn: Callable[[ModelSpec], dict[str, list[Any]]]
) -> dict[str, dict]:
    """Submit one task per ModelSpec to a thread pool; isolate per-spec errors."""
    results: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=max(1, len(selected))) as pool:
        futures = {spec.id: pool.submit(task_fn, spec) for spec in selected}
        for mid, fut in futures.items():
            try:
                results[mid] = fut.result()
            except Exception as exc:
                logger.error("Adapter failed model=%s: %s", mid, exc, exc_info=True)
                results[mid] = {}

    return results
