import os
from typing import Any

from devtools.imageio import pil_to_b64
from openai import OpenAI
from PIL import Image

from ..samples import Sample
from .base import BaseAdapter


class LLMVLMAdapter(BaseAdapter):
    """Unified LLM / VLM service backed by the OpenAI-compatible chat API.

    When ``image_path`` is provided to :meth:`response`, the request includes
    the base64-encoded image (VLM mode).  Otherwise a plain text request is
    sent (LLM mode).
    """

    def __init__(self, api_base: str, name: str, max_token: int = 2048):
        self._client = OpenAI(
            base_url=api_base,
            api_key="EMPTY",
            max_retries=3,
            timeout=30.0,
            default_headers={"aiaas-apikey": os.getenv("AIAAS_APIKEY")},
        )
        self._model_name = name
        self._max_token = max_token

    def response(
        self,
        system_prompt: str,
        user_prompt: str,
        image_path: str | None = None,
        response_format: dict | None = None,
    ) -> str:
        if image_path is not None:
            img = Image.open(image_path)
            if img.mode != "RGB":
                img = img.convert("RGB")

            b64_img = pil_to_b64(img)
            user_content = [
                {"type": "text", "text": user_prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"},
                },
            ]
        else:
            user_content = user_prompt

        create_kwargs: dict[str, Any] = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "model": self._model_name,
            "max_completion_tokens": self._max_token,
            "temperature": 0.4,
            "top_p": 0.9,
        }
        if response_format is not None:
            create_kwargs["response_format"] = response_format
        completion = self._client.chat.completions.create(**create_kwargs)

        return completion.choices[0].message.content

    def _invoke_impl(
        self,
        sample: Sample,
        system_prompt: str = "",
        user_prompt: str = "",
        response_format: dict | None = None,
        **_: Any,
    ) -> str:
        if sample.image_path is not None:
            img = Image.open(sample.image_path)
            if img.mode != "RGB":
                img = img.convert("RGB")

            b64_img = pil_to_b64(img)
            user_content = [
                {"type": "text", "text": user_prompt if user_prompt else sample.question},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"},
                },
            ]
        else:
            user_content = f"{user_prompt}\n{sample.question}" if user_prompt else str(sample.question)

        create_kwargs: dict[str, Any] = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "model": self._model_name,
            "max_completion_tokens": self._max_token,
            "temperature": 0.4,
            "top_p": 0.9,
        }
        if response_format is not None:
            create_kwargs["response_format"] = response_format
        completion = self._client.chat.completions.create(**create_kwargs)

        return completion.choices[0].message.content

    def close(self) -> None:
        self._client.close()
