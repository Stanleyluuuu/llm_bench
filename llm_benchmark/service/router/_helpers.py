import json
import re
from typing import Any

from llm_benchmark.schema import ModelIn, ModelKind, ModelSpec, ModelType

SCHEMA_VERSION = 2


def _load_json_with_nan(filepath: str) -> Any:
    """Load JSON file, replacing NaN/Infinity with null for JSON compatibility."""
    with open(filepath, encoding="utf-8") as f:
        text = f.read()

    text = re.sub(r"\bNaN\b", "null", text)
    text = re.sub(r"\bInfinity\b", "null", text)
    text = re.sub(r"\b-Infinity\b", "null", text)

    return json.loads(text)


def _format_scores(score: Any) -> dict[str, Any]:
    """Coerce RAGAS Result / dict into a JSON-serialisable scores dict."""
    if not score:
        return {}

    scores_dict = score.to_pandas().to_dict() if hasattr(score, "to_pandas") else dict(score)
    if scores_dict and isinstance(next(iter(scores_dict.values())), dict):
        aggregated: dict[str, Any] = {}
        per_sample: dict[str, list] = {}
        for k, v in scores_dict.items():
            values = list(v.values()) if isinstance(v, dict) else [v]
            if values and isinstance(values[0], int | float):
                aggregated[k] = sum(values) / len(values)
                per_sample[f"per_sample_{k}"] = values

        aggregated.update(per_sample)

        return aggregated

    return scores_dict


def _format_perf(perf: Any) -> str:
    if isinstance(perf, dict) and perf:
        return f"{perf.get('avg_response_time', 0):.2f}s (avg)"

    return ""


def _to_spec(m: ModelIn) -> ModelSpec:
    resize: tuple[int, int] | None = None
    if m.resize and len(m.resize) >= 2:
        resize = (int(m.resize[0]), int(m.resize[1]))

    return ModelSpec(
        id=m.id,
        kind=ModelKind(m.kind),
        model_type=ModelType(m.model_type),
        display_name=m.display_name,
        name=m.name,
        api_base=m.api_base,
        max_token=m.max_token,
        resize=resize,
    )


def _is_v2_payload(data: dict[str, Any]) -> bool:
    return data.get("schema_version") == SCHEMA_VERSION and isinstance(data.get("models"), dict)
