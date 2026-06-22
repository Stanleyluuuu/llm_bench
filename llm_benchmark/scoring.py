import ast
import json
import re
import re as _re
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from datasets import Dataset
from ragas import evaluate as ragas_evaluate
from ragas.metrics import answer_correctness, answer_similarity

from llm_benchmark.metrics.deepeval_judgement import DeepEvalJudgementService
from llm_benchmark.metrics.deepeval_ragas import evaluate_rag_metrics_deepeval
from llm_benchmark.metrics.llm_judgement import LLMJudgementService
from llm_benchmark.settings import app_settings

from .logging import logger
from .metrics import calculate_roi_accuracy, normalize_box, resize_vlm_response
from .metrics.ragas import (
    create_ragas_embeddings,
    create_ragas_llm,
)
from .schema import ModelSpec, TaskConfig

_DASH_CHARS = ("\u2010", "\u2011", "\u2012", "\u2013", "\u2014", "\u2015", "\uff0d")
_CODE_FENCE_RE = _re.compile(r"```(?:json)?\s*(.*?)\s*```", _re.DOTALL)


def _extract_json_str(text: str) -> str:
    """Strip markdown code fences (```json ... ```) from model output before JSON parsing."""
    m = _CODE_FENCE_RE.search(text)

    return m.group(1) if m else text


def _try_repair_json(text: str) -> str | None:
    """Attempt to repair truncated JSON by closing unclosed brackets."""
    # Count unmatched braces/brackets
    opens = 0
    open_brackets = 0
    in_string = False
    escape_next = False
    for ch in text:
        if escape_next:
            escape_next = False
            continue
        if ch == "\\":
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            opens += 1
        elif ch == "}":
            opens -= 1
        elif ch == "[":
            open_brackets += 1
        elif ch == "]":
            open_brackets -= 1

    if opens > 0 or open_brackets > 0:
        repaired = text + ("]" * open_brackets) + ("}" * opens)
        try:
            json.loads(repaired)

            return repaired
        except json.JSONDecodeError:
            pass

    return None


def _parse_json_or_literal(text: str) -> Any:
    """Parse JSON string; fall back to ast.literal_eval for Python-style dict/list literals."""
    extracted = _extract_json_str(text).strip()
    try:
        return json.loads(extracted)
    except json.JSONDecodeError:
        repaired = _try_repair_json(extracted)
        if repaired is not None:
            return json.loads(repaired)
        return ast.literal_eval(extracted)


def _normalize_text(text: str) -> str:
    for ch in _DASH_CHARS:
        text = text.replace(ch, "-")

    return text.strip()


def _normalize_data(data_dict: dict) -> dict:
    output = dict(data_dict)
    if "answer" in output:
        output["answer"] = [_normalize_text(a) for a in output["answer"]]
    if "ground_truth" in output:
        output["ground_truth"] = [_normalize_text(g) for g in output["ground_truth"]]

    return output


def score_ragas_deepeval(results_by_model: dict[str, dict]) -> dict[str, dict[str, Any]]:
    """DeepEval counterpart of :func:`score_ragas`.

    Computes faithfulness + answer_relevancy per sample via DeepEval and
    aggregates into the same flat ``{metric: mean, per_sample_metric: [...]}``
    shape so the frontend can render either engine's output.
    """
    output: dict[str, dict[str, Any]] = {}
    for model_id, result in results_by_model.items():
        answers = result.get("answer", [])
        if not answers:
            output[model_id] = {}
            continue
        questions = result.get("question", [])
        ground_truths = result.get("ground_truth", [])
        contexts_list = result.get("contexts", [])
        per_metric: dict[str, list[float]] = {}
        for idx, answer in enumerate(answers):
            q = questions[idx] if idx < len(questions) else ""
            gt = ground_truths[idx] if idx < len(ground_truths) else ""
            ctx = contexts_list[idx] if idx < len(contexts_list) else []
            if isinstance(ctx, str):
                ctx = [ctx]
            scores = evaluate_rag_metrics_deepeval(
                question=q, answer=_normalize_text(str(answer)), ground_truth=_normalize_text(str(gt)), contexts=ctx
            )
            for name, val in scores.items():
                per_metric.setdefault(name, []).append(val)

        flat: dict[str, Any] = {}
        for name, vals in per_metric.items():
            if vals:
                flat[name] = sum(vals) / len(vals)
                flat[f"per_sample_{name}"] = vals
        output[model_id] = flat

    return output


def score_ragas(results_by_model: dict[str, dict]) -> dict[str, dict[str, Any]]:
    ragas_llm = create_ragas_llm(
        app_settings.llm_large.api_base,
        app_settings.llm_large.name,
        app_settings.llm_large.max_token,
    )

    ragas_embeddings = create_ragas_embeddings()

    output: dict[str, dict[str, Any]] = {}
    for model_id, result in results_by_model.items():
        if not result.get("answer"):
            output[model_id] = {}
            continue
        try:
            ds = Dataset.from_dict(_normalize_data(result))
            if ds.num_rows == 0:
                logger.warning("RAGAS: empty dataset for model=%s", model_id)
                output[model_id] = {}
                continue

            score = ragas_evaluate(
                ds,
                metrics=[answer_correctness, answer_similarity],
                llm=ragas_llm,
                embeddings=ragas_embeddings,
            )

            if hasattr(score, "to_pandas"):
                df = score.to_pandas()
                flat: dict[str, Any] = {}
                for col in df.columns:
                    try:
                        flat[col] = float(df[col].mean())
                        flat[f"per_sample_{col}"] = df[col].tolist()
                    except (TypeError, ValueError):
                        pass

                output[model_id] = flat
            else:
                output[model_id] = dict(score)

        except Exception as exc:
            logger.error("RAGAS scoring failed for model=%s: %s", model_id, exc, exc_info=True)
            output[model_id] = {}

    return output


def score_iou(
    results_by_model: dict[str, dict], project_config: TaskConfig, project_name: str, specs_by_id: dict[str, ModelSpec]
) -> dict[str, dict[str, Any]]:
    iou_threshold = float(project_config.inference_params.get("iou_threshold", 0.5))
    _task_space_overrides: dict[str, str] = project_config.inference_params.get("model_space_overrides") or {}

    def _resize_for(model_id: str) -> tuple[int, int] | None:
        spec = specs_by_id.get(model_id)
        if spec is None or spec.resize is None:
            if model_id == "vlm_large":
                return app_settings.vlm_large.resize
            if model_id == "vlm_small":
                return app_settings.vlm_small.resize

            return None

        return spec.resize

    def _model_space_for(model_id: str) -> str:
        # 1. Task-level override wins.
        if model_id in _task_space_overrides:
            return str(_task_space_overrides[model_id])
        # 2. Custom model spec (user-supplied model_space).
        spec = specs_by_id.get(model_id)
        if spec is not None and spec.kind.value == "custom":
            return spec.model_space
        # 3. Global builtin setting.
        if model_id == "vlm_large":
            return app_settings.vlm_large.model_space
        if model_id == "vlm_small":
            return app_settings.vlm_small.model_space
        return "absolute"

    def _eval_one(model_id: str, result: dict) -> tuple[dict, list | None]:
        from PIL import Image as _PILImage

        image_paths = result.get("image_path", [])
        acc_list: list[float] = []
        mean_iou_list: list[float] = []
        iou_detail_list: list[dict] = []
        resize = _resize_for(model_id)
        model_space = _model_space_for(model_id)
        parse_error_indices: list[int] = []

        resized_answers: list | None = [] if resize else None

        if resize:
            result["resize_size"] = list(resize)

        # Expose the coordinate system so the frontend can display the label.
        result["model_space"] = model_space
        if resize:
            result["coord_label"] = f"resize {resize[0]}×{resize[1]}"
        elif model_space == "normalized":
            result["coord_label"] = "normalized 0~1"
        else:
            result["coord_label"] = "原圖像素"

        for idx, (answer, ground_truth) in enumerate(
            zip(result.get("answer", []), result.get("ground_truth", []), strict=False)
        ):
            try:
                vlm_response = _parse_json_or_literal(answer) if isinstance(answer, str) else answer
                gt_data = _parse_json_or_literal(ground_truth) if isinstance(ground_truth, str) else ground_truth

                if not isinstance(vlm_response, dict):
                    raise ValueError(
                        f"expected dict mapping space keys to bbox coords, "
                        f"got {type(vlm_response).__name__}: {str(vlm_response)[:120]}"
                    )

                if resize and idx < len(image_paths) and image_paths[idx]:
                    vlm_response = resize_vlm_response(vlm_response, resize, image_paths[idx])
                    resized_answers.append(json.dumps(vlm_response))
                elif model_space == "normalized" and idx < len(image_paths) and image_paths[idx]:
                    img_w, img_h = _PILImage.open(image_paths[idx]).size
                    vlm_response = {k: normalize_box(v, img_w, img_h, model_space) for k, v in vlm_response.items()}

                accuracy, per_key_detail = calculate_roi_accuracy(vlm_response, gt_data, iou_threshold)
                acc_list.append(accuracy)
                iou_detail_list.append(per_key_detail)

                sample_ious = [v["iou"] for v in per_key_detail.values()] if per_key_detail else []
                sample_mean_iou = sum(sample_ious) / len(sample_ious) if sample_ious else 0.0
                mean_iou_list.append(sample_mean_iou)
            except Exception as exc:
                logger.error("IoU scoring error model=%s idx=%d: %s", model_id, idx, exc, exc_info=True)
                # Mark as parse error — do NOT append 0.0 to avoid polluting averages.
                parse_error_indices.append(idx)
                iou_detail_list.append({"_parse_error": str(exc)})
                if resize:
                    resized_answers.append(None)

        # Compute means excluding parse-error samples.
        valid_acc = acc_list  # list only contains successful samples
        valid_iou = mean_iou_list
        score = {
            "mean_iou": sum(valid_iou) / len(valid_iou) if valid_iou else 0.0,
            "per_sample_mean_iou": mean_iou_list,
            "accuracy": sum(valid_acc) / len(valid_acc) if valid_acc else 0.0,
            "per_sample_accuracy": acc_list,
            "per_sample_iou_detail": iou_detail_list,
            "iou_threshold": iou_threshold,
            "parse_error_count": len(parse_error_indices),
        }

        return score, resized_answers

    scores: dict[str, dict[str, Any]] = {}
    with ThreadPoolExecutor(max_workers=min(8, max(1, len(results_by_model)))) as pool:
        futures = {model_id: pool.submit(_eval_one, model_id, result) for model_id, result in results_by_model.items()}

        for model_id, fut in futures.items():
            score, resized = fut.result()
            scores[model_id] = score

            if resized is not None:
                results_by_model[model_id]["resized_answer"] = resized

    return scores


def score_llm_judge(
    results_by_model: dict[str, dict], *, use_ragas: bool = False, engine: str = "custom"
) -> dict[str, dict[str, Any]]:
    if not results_by_model:
        return {}

    # Use the first model's (question, ground_truth) as the canonical reference.
    ref_model_id = next(iter(results_by_model))
    ref = results_by_model[ref_model_id]
    questions = ref.get("question", [])
    ground_truths = ref.get("ground_truth", [])

    model_ids = list(results_by_model.keys())
    answers_list = [results_by_model[model_id].get("answer", []) for model_id in model_ids]

    svc = DeepEvalJudgementService() if engine == "deepeval" else LLMJudgementService()
    comparison = svc.compare_models(
        questions=questions,
        ground_truths=ground_truths,
        model_responses_list=answers_list,
        model_names=model_ids,
        use_ragas=use_ragas,
    )

    summary = comparison.get("summary", {})
    per_question = comparison.get("results", [])

    model_wins = summary.get("model_wins", {})
    model_ties = summary.get("model_ties", {})
    reasons = summary.get("reasons", [])

    judgement_blob = [
        {
            "winner": result.get("winner"),
            "outcome": result.get("outcome"),
            "winner_model_ids": result.get("winner_model_ids", []),
            "reason": result.get("reason"),
            "scores": result.get("scores"),  # None for multi-model, dict for n=1
            "average_score": result.get("average_score"),  # None for multi-model, float for n=1
        }
        for result in per_question
    ]

    output: dict[str, dict[str, Any]] = {}
    for model_id in model_ids:
        results_by_model[model_id]["llm_judgement"] = judgement_blob
        output[model_id] = {
            "wins": model_wins.get(model_id, 0),
            "ties": model_ties.get(model_id, 0),
            "reasons": reasons,
        }

    return output


def _parse_json_field(s: Any) -> Any:
    try:
        return json.loads(s) if isinstance(s, str) else s
    except (json.JSONDecodeError, TypeError):
        return {}


def _eval_output_key_ground_truth(
    key: str,
    questions: list,
    key_gts: list[str],
    key_answers_per_model: dict[str, list[str]],
    ragas_llm: Any,
    ragas_embeddings: Any,
    eval_per_model: dict[str, dict[str, Any]],
) -> None:
    for mid, key_answers in key_answers_per_model.items():
        if not key_answers:
            continue
        try:
            ds = Dataset.from_dict(
                _normalize_data({"question": questions, "answer": key_answers, "ground_truth": key_gts})
            )
            score = ragas_evaluate(
                ds, metrics=[answer_correctness, answer_similarity], llm=ragas_llm, embeddings=ragas_embeddings
            )
            df = score.to_pandas()
            entry: dict[str, Any] = {
                "method": "GROUND_TRUTH",
                "answer_correctness": float(df["answer_correctness"].mean()) if "answer_correctness" in df else 0.0,
                "answer_similarity": float(df["answer_similarity"].mean()) if "answer_similarity" in df else 0.0,
            }
            if "answer_correctness" in df:
                entry["per_sample_answer_correctness"] = df["answer_correctness"].tolist()
            eval_per_model[mid][key] = entry
        except Exception as exc:
            logger.error("OutputParser/RAGAS error key=%s model=%s: %s", key, mid, exc, exc_info=True)
            eval_per_model[mid][key] = {"method": "GROUND_TRUTH", "error": str(exc)}


def _eval_output_key_llm_judgement(
    key: str,
    questions: list,
    key_gts: list[str],
    key_answers_per_model: dict[str, list[str]],
    results_by_model: dict[str, dict],
    eval_per_model: dict[str, dict[str, Any]],
) -> None:

    try:
        model_ids = list(results_by_model.keys())
        slot_answers = [key_answers_per_model[mid] for mid in model_ids]
        svc = LLMJudgementService()
        comp = svc.compare_models(
            questions=questions,
            ground_truths=key_gts,
            model_responses_list=slot_answers,
            model_names=model_ids,
        )
        summary = comp.get("summary", {})
        model_wins = summary.get("model_wins", {})
        total_samples = summary.get("total_samples", 0)
        reasons = summary.get("reasons", [])
        for mid in model_ids:
            if not key_answers_per_model[mid]:
                continue

            eval_per_model[mid][key] = {
                "method": "LLM_JUDGEMENT",
                "wins": model_wins.get(mid, 0),
                "total_samples": total_samples,
                "reasons": reasons,
            }
    except Exception as exc:
        logger.error("OutputParser/LLM_JUDGE error key=%s: %s", key, exc, exc_info=True)
        for mid in results_by_model:
            eval_per_model[mid][key] = {"method": "LLM_JUDGEMENT", "error": str(exc)}


def score_output_parser(
    results_by_model: dict[str, dict],
    project_config: TaskConfig,
) -> dict[str, dict[str, Any]]:
    output_parser_key: dict[str, str] = project_config.inference_params.get("outputparser_key", {}) or {}
    if not output_parser_key:
        return {mid: {} for mid in results_by_model}

    parsed: dict[str, list[dict]] = {
        mid: [_parse_json_field(a) for a in r.get("answer", [])] for mid, r in results_by_model.items()
    }
    ref_mid = next(iter(results_by_model))
    questions = results_by_model[ref_mid].get("question", [])
    parsed_gts = [_parse_json_field(gt) for gt in results_by_model[ref_mid].get("ground_truth", [])]

    eval_per_model: dict[str, dict[str, Any]] = {mid: {} for mid in results_by_model}
    ragas_llm: Any = None
    ragas_embeddings: Any = None

    for key, eval_type in output_parser_key.items():
        if not eval_type:
            continue
        key_gts = [str(gt.get(key, "")) for gt in parsed_gts]
        key_answers_per_model = {mid: [str(a.get(key, "")) for a in parsed[mid]] for mid in results_by_model}

        if eval_type == "GROUND_TRUTH":
            if ragas_llm is None:
                ragas_llm = create_ragas_llm(
                    app_settings.llm_large.api_base,
                    app_settings.llm_large.name,
                    app_settings.llm_large.max_token,
                )
                ragas_embeddings = create_ragas_embeddings()

            _eval_output_key_ground_truth(
                key, questions, key_gts, key_answers_per_model, ragas_llm, ragas_embeddings, eval_per_model
            )

        elif eval_type == "LLM_JUDGEMENT":
            _eval_output_key_llm_judgement(
                key,
                questions,
                key_gts,
                key_answers_per_model,
                results_by_model,
                eval_per_model,
            )

    return {mid: _flatten_output_parser_results(eval_per_model[mid]) for mid in results_by_model}


def _flatten_output_parser_results(eval_results: dict[str, dict]) -> dict:
    flat: dict[str, Any] = {}
    per_sample_correctness_lists: list[list[float]] = []
    for key, metrics in eval_results.items():
        method = metrics.get("method", "")
        if method == "GROUND_TRUTH":
            flat[f"{key}_answer_correctness"] = metrics.get("answer_correctness", 0.0)
            flat[f"{key}_answer_similarity"] = metrics.get("answer_similarity", 0.0)
            if "per_sample_answer_correctness" in metrics:
                per_sample_correctness_lists.append(metrics["per_sample_answer_correctness"])
        elif method == "LLM_JUDGEMENT":
            flat[f"{key}_wins"] = metrics.get("wins", 0)
            if "reasons" in metrics:
                flat[f"{key}_reasons"] = metrics["reasons"]
    if per_sample_correctness_lists:
        n = len(per_sample_correctness_lists[0])
        merged = [
            sum(lst[i] for lst in per_sample_correctness_lists if i < len(lst)) / len(per_sample_correctness_lists)
            for i in range(n)
        ]
        flat["per_sample_accuracy"] = merged

    return flat


def normalize_plate(text: str) -> str:
    text = str(text).strip().upper()
    text = re.sub(r'\s+', '', text)
    
    return text


def normalize_yesno(text: str) -> str:
    text = str(text).strip().lower()
    text = re.sub(r'[^\w\s]', '', text).strip()
    return text

def normalize_by_project(text: str, project_name: str) -> str:
    if project_name == "Plate_Detection":
        return normalize_plate(text)
    elif project_name == "Fallen":
        return normalize_yesno(text)

    return str(text).strip()

def score_exact_match(results_by_model: dict[str, dict], project_name: str) -> dict[str, dict[str, Any]]:
    output: dict[str, dict[str, Any]] = {}

    for model_id, result in results_by_model.items():
        answers = result.get("answer", [])
        ground_truths = result.get("ground_truth", [])

        if not answers:
            output[model_id] = {}
            continue

        acc_list: list[float] = [
            1.0 if normalize_by_project(a, project_name) == str(gt).strip() else 0.0 for a, gt in zip(answers, ground_truths, strict=False)
        ]
        output[model_id] = {
            "accuracy": sum(acc_list) / len(acc_list) if acc_list else 0.0,
            "per_sample_accuracy": acc_list,
        }

    return output


def dispatch_scoring(
    results_by_model: dict[str, dict],
    project_config: TaskConfig,
    project_name: str,
    specs_by_id: dict[str, ModelSpec],
    *,
    use_ragas: bool = False,
    engine: str = "custom",
) -> dict[str, dict[str, Any]]:
    if not results_by_model:
        return {}

    metrics = project_config.metrics

    if metrics == "iou":
        return score_iou(results_by_model, project_config, project_name, specs_by_id)
    elif metrics == "OutputParser":
        return score_output_parser(results_by_model, project_config)
    elif metrics == "ragas":
        if engine == "deepeval":
            return score_ragas_deepeval(results_by_model)
        return score_ragas(results_by_model)
    elif metrics == "llm":
        return score_llm_judge(results_by_model, use_ragas=use_ragas, engine=engine)
    elif metrics == "exact_match":
        return score_exact_match(results_by_model, project_name=project_name)

    return {model_id: {} for model_id in results_by_model}
