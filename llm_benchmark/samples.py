import ast
import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from .logging import logger
from .schema import TaskConfig

_PROJECTS_DIR: Path = Path(__file__).parent.parent / "dataset"


class Sample(BaseModel):
    """One row of the benchmark dataset, normalised for adapter consumption."""

    question: str
    ground_truth: str
    image_path: str | None = None
    form: dict[str, Any] | None = None


def load_samples(project: str, config: TaskConfig, dataset_path: Path) -> list[Sample]:
    """Read a JSONL dataset file and build canonical :class:`Sample` objects in one pass.

    Combines the previous ``load_dataset`` (JSONL → DataFrame) and
    ``build_samples`` (DataFrame → list[Sample]) into a single function
    that streams JSONL rows directly into Sample instances.
    """
    is_vision = config.type == "VLM"
    form_input = bool(config.inference_params.get("form_input", False))
    samples: list[Sample] = []

    with open(dataset_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            obj = json.loads(line)
            inp = obj.get("input", {}) or {}

            # --- Determine input value ---
            if inp.get("text") is not None:
                input_val = inp["text"]
            elif inp.get("image") is not None:
                input_val = inp["image"]
            elif inp.get("form") is not None:
                input_val = json.dumps(inp["form"], ensure_ascii=False)
            else:
                input_val = ""

            # --- Determine ground truth ---
            gt = obj.get("ground_truth", "")
            ground_truth = json.dumps(gt, ensure_ascii=False) if isinstance(gt, dict | list) else str(gt)

            # --- Build image_path / form based on project type ---
            image_path: str | None = None
            form: dict | None = None

            if is_vision:
                img_file = inp.get("image") or ""
                image_path = str(_PROJECTS_DIR / project / "dataset" / img_file) if img_file else None
            elif form_input and isinstance(input_val, str) and input_val.strip().startswith("{"):
                try:
                    # 優先嘗試標準 JSON 解析
                    form = json.loads(input_val)
                except json.JSONDecodeError:
                    try:
                        parsed = ast.literal_eval(input_val)
                        if isinstance(parsed, dict):
                            form = parsed
                        else:
                            logger.error("Parsed value is not a dict: %s", type(parsed))
                            form = None
                    except (ValueError, SyntaxError) as exc:
                        logger.error("Error parsing form input: %s", exc, exc_info=True)
                        form = None

            samples.append(
                Sample(
                    question=str(input_val),
                    ground_truth=ground_truth,
                    image_path=image_path,
                    form=form,
                )
            )

    return samples
