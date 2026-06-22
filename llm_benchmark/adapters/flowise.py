import json
import os
import time
from typing import Any

import requests
from devtools.imageio import pil_to_b64
from PIL import Image

from ..logging import logger
from ..samples import Sample
from ..settings import app_settings, build_default_override_config
from .base import BaseAdapter


def _image_to_data_url(image_path: str) -> str:
    image = Image.open(image_path)
    if image.mode != "RGB":
        image = image.convert("RGB")

    return "data:image/jpeg;base64," + pil_to_b64(image)


class FlowiseResponseParser:
    @staticmethod
    def parse_response(response: dict[str, Any], return_raw: bool = False) -> "str | dict | Any":
        if not response:
            return "" if not return_raw else response

        parsers = [
            FlowiseResponseParser._parse_text_field,
            FlowiseResponseParser._parse_json_field,
        ]

        for parser in parsers:
            result = parser(response)
            if result is not None:
                return result

        return response if return_raw else str(response)

    @staticmethod
    def _parse_text_field(response: dict[str, Any]) -> "str | None":
        if isinstance(response, dict) and "text" in response:
            return response["text"]

        return None

    @staticmethod
    def _parse_json_field(response: dict[str, Any]) -> "str | dict | None":
        if isinstance(response, dict) and "json" in response:
            json_data = response["json"]
            if isinstance(json_data, str):
                try:
                    return json.loads(json_data)
                except json.JSONDecodeError:
                    return json_data

            return json_data

        return None


class FlowiseAdapter(BaseAdapter):
    """HTTP adapter that calls a Flowise prediction endpoint; supports text, form, and vision payloads."""

    def __init__(
        self,
        *,
        base_url: str,
        flow_id: str,
        model_name: str,
        api_base: str,
        request_timeout: int,
        form_input: bool = False,
        form_key: dict[str, Any] | None = None,
        image_form_key: str = "image",
    ) -> None:
        super().__init__(name=model_name)
        self.base_url = base_url
        self.flow_id = flow_id
        self.model_name = model_name
        self.api_base = api_base
        self.request_timeout = int(request_timeout)
        self.form_input = bool(form_input)
        self.form_key = form_key or {}
        self.image_form_key = image_form_key

    def _build_form(self, sample: Sample) -> dict[str, Any]:
        if sample.form is not None:
            form = dict(sample.form)
        else:
            form = {key: str(sample.question) for key in self.form_key} or {"question": str(sample.question)}
        if sample.image_path is not None:
            form[self.image_form_key] = _image_to_data_url(sample.image_path)
        return form

    def _invoke_impl(
        self,
        sample: Sample,
        *,
        override_config: dict[str, Any],
        **_: Any,
    ) -> str:
        if sample.image_path is not None and not self.form_input:
            raise NotImplementedError(
                "FlowiseAdapter received a vision sample but FORM_INPUT is False. "
                "Configure FORM_INPUT=true and FORM_KEY (with an image-bearing key) "
                "to enable Flowise+VLM."
            )

        url = f"{self.base_url.rstrip('/')}/api/v1/prediction/{self.flow_id}"
        payload: dict[str, Any] = {
            "overrideConfig": (
                override_config
                if override_config is not None
                else build_default_override_config(self.model_name, self.api_base)
            )
        }
        if self.form_input:
            payload["form"] = self._build_form(sample)
        else:
            payload["question"] = str(sample.question)

        max_retries = app_settings.flowise.max_retries
        for attempt in range(1, max_retries + 1):
            try:
                response = requests.post(
                    url,
                    json=payload,
                    timeout=self.request_timeout,
                    headers={"Authorization": f"Bearer {os.getenv('FLOWISE_KEY')}"},
                )
                raw_response = response.json()
                return str(FlowiseResponseParser.parse_response(raw_response, return_raw=True))
            except requests.exceptions.Timeout:
                logger.warning("FlowiseAdapter timeout (attempt %d/%d)", attempt, max_retries)
                if attempt == max_retries:
                    raise requests.exceptions.Timeout(
                        f"Flowise endpoint timed out after {max_retries} attempts ({self.request_timeout}s each): {url}"
                    ) from None
            except Exception as e:
                logger.warning("FlowiseAdapter error (attempt %d/%d): %s", attempt, max_retries, e)
                if attempt == max_retries:
                    raise RuntimeError(f"Flowise prediction failed after {max_retries} retries: {e}") from e

            if app_settings.flowise.retry_delay > 0:
                time.sleep(app_settings.flowise.retry_delay)

        raise RuntimeError("FlowiseAdapter: unexpected exit from retry loop")
