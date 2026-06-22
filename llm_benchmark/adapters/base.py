import abc
import time
from typing import Any

from pydantic import BaseModel
from typing_extensions import Self

from ..logging import logger
from ..samples import Sample


class AdapterResult(BaseModel):
    answer: str
    response_time: float


class ResultBuilder:
    """Accumulates per-sample results into the canonical 4-list dict shape."""

    def __init__(self) -> None:
        self.question: list[str] = []
        self.answer: list[str] = []
        self.ground_truth: list[str] = []
        self.response_time: list[float] = []
        self.image_path: list[str | None] = []

    def add(self, sample: Sample, result: AdapterResult) -> None:
        self.question.append(str(sample.question))
        self.answer.append(str(result.answer))
        self.ground_truth.append(str(sample.ground_truth))
        self.response_time.append(result.response_time)
        self.image_path.append(sample.image_path)

    def to_dict(self) -> dict[str, list[Any]]:
        return {
            "question": list(self.question),
            "answer": list(self.answer),
            "ground_truth": list(self.ground_truth),
            "response_time": list(self.response_time),
            "image_path": list(self.image_path),
        }


class BaseAdapter(abc.ABC):
    """Common timing / logging / error-wrapping for all model adapters.

    Subclasses implement :meth:`_invoke_impl` and :meth:`_get_adapter_type`.
    Constructor parameters are model-level settings (api_base, model name,
    request timeout, ...); per-call data (sample, prompts, override_config,
    ...) is passed as kwargs to :meth:`invoke`.

    Registry mechanism:
        Subclasses call ``SubClass.register()`` to register themselves in
        the adapter type registry. The ``from_spec()`` classmethod on
        BaseAdapter dispatches to the correct subclass based on the
        registered adapter type string.
    """

    name: str

    def __init__(self, *, name: str = "") -> None:
        self.name = name

    @abc.abstractmethod
    def _invoke_impl(self, sample: Sample, **kwargs: Any) -> str:
        """Subclass-specific per-sample call. Must return the raw answer string."""

    def invoke(self, sample: Sample, **kwargs: Any) -> AdapterResult:
        """Run a single sample. Wraps :meth:`_invoke_impl` with timing + logging."""
        start = time.time()
        try:
            answer = self._invoke_impl(sample, **kwargs)
        except Exception as exc:
            elapsed = time.time() - start
            logger.error(
                "Adapter %s failed after %.2fs: %s",
                self.__class__.__name__,
                elapsed,
                exc,
                exc_info=True,
            )
            raise

        return AdapterResult(answer=str(answer), response_time=time.time() - start)

    def close(self) -> None:
        """Release any resources held by this adapter.  No-op by default."""
        return

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def run(self, samples: list[Sample], **per_call: Any) -> dict[str, list[Any]]:
        """Run adapter over every sample, returning the canonical 4-list dict."""
        builder = ResultBuilder()
        for sample in samples:
            result = self.invoke(sample, **per_call)
            builder.add(sample, result)

        return builder.to_dict()
