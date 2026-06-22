from typing import Any

import requests

from ..samples import Sample
from .base import BaseAdapter


def parse_sse_response(text: str) -> str:
    lines = text.strip().split("\n")
    content: list[str] = []
    for line in lines:
        if line.startswith("event: metadata"):
            break
        if line.startswith("data: "):
            content.append(line[6:])
    return "".join(content)


class CustomAPIAdapter(BaseAdapter):
    DEFAULT_TIMEOUT: int = 60

    def __init__(
        self,
        endpoint_url: str,
        api_param: dict[str, Any] | None = None,
        streaming: bool = False,
        request_timeout: int | None = None,
    ) -> None:
        super().__init__(name=endpoint_url)
        self.endpoint_url = endpoint_url
        self.api_param = api_param or {}
        self.streaming = bool(streaming)
        self.request_timeout = int(request_timeout) if request_timeout else self.DEFAULT_TIMEOUT

    def _invoke_impl(self, sample: Sample, **_: Any) -> str:
        payload = {
            "employee_id": self.api_param.get("employee_id", ""),
            "question": sample.question or self.api_param.get("question", ""),
        }
        response = requests.post(
            self.endpoint_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=self.request_timeout,
        )
        text = parse_sse_response(response.text) if self.streaming else response.text
        return str(text)

