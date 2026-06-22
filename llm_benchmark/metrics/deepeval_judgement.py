"""DeepEval-based LLM judge.

An alternative to :class:`llm_benchmark.metrics.llm_judgement.LLMJudgementService`
built on `deepeval <https://github.com/confident-ai/deepeval>`_'s ``GEval`` metric.
It exposes the **same public surface** (``evaluate`` / ``compare_models`` and the
same result/summary dict shapes) so :mod:`llm_benchmark.scoring` can drive either
engine. The hand-written service is intentionally left in place for comparison.

Scoring model:
- Single model (n=1): three GEval dimensions (accuracy, completeness,
  relevance & clarity) each produce a 0-1 score, rescaled to 1-5 integers to
  match the hand-written judge's output.
- Multiple models (n>1): each model gets an overall GEval correctness score;
  the highest wins, near-ties (within ``_TIE_MARGIN``) are reported as a tie.
"""

from __future__ import annotations

from typing import Any

from llm_benchmark.logging import logger

from .deepeval_model import DeepEvalLLM, deepeval_available
from .deepeval_ragas import evaluate_rag_metrics_deepeval

# Two models whose overall scores differ by less than this are called a tie.
_TIE_MARGIN = 0.05


def _to_five(score_0_1: float) -> int:
    """Map a 0-1 GEval score to a 1-5 integer, matching the hand-written judge."""
    return max(1, min(5, round(score_0_1 * 4) + 1))


class DeepEvalJudgementService:
    def __init__(self, api_base: str | None = None, name: str | None = None) -> None:
        self._model = DeepEvalLLM(api_base=api_base, model_name=name)

    # -- metric builders -----------------------------------------------------------
    def _single_metrics(self) -> list:
        from deepeval.metrics import GEval
        from deepeval.test_case import LLMTestCaseParams

        params = [LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.EXPECTED_OUTPUT]
        return [
            (
                "accuracy",
                GEval(
                    name="Accuracy",
                    criteria="判斷 actual_output 相對於 expected_output 是否有事實錯誤或幻覺；越準確分數越高。",
                    evaluation_params=params,
                    model=self._model,
                    async_mode=False,
                ),
            ),
            (
                "completeness",
                GEval(
                    name="Completeness",
                    criteria="判斷 actual_output 是否涵蓋 expected_output 中的關鍵資訊、有無重大遺漏。",
                    evaluation_params=params,
                    model=self._model,
                    async_mode=False,
                ),
            ),
            (
                "relevance_clarity",
                GEval(
                    name="Relevance and Clarity",
                    criteria="判斷 actual_output 是否切題、無冗餘，且語言通順、結構清晰。",
                    evaluation_params=params,
                    model=self._model,
                    async_mode=False,
                ),
            ),
        ]

    def _overall_metric(self):
        from deepeval.metrics import GEval
        from deepeval.test_case import LLMTestCaseParams

        return GEval(
            name="Overall Correctness",
            criteria=(
                "綜合評估 actual_output 相對 expected_output 的整體品質，"
                "以準確性為最高權重，其次完整性、相關性與清晰度。"
            ),
            evaluation_params=[
                LLMTestCaseParams.INPUT,
                LLMTestCaseParams.ACTUAL_OUTPUT,
                LLMTestCaseParams.EXPECTED_OUTPUT,
            ],
            model=self._model,
            async_mode=False,
        )

    # -- public API ----------------------------------------------------------------
    def evaluate(
        self,
        question: str,
        ground_truth: str,
        responses: dict[str, str],
        *,
        use_ragas: bool = False,
        contexts: list[str] | None = None,
    ) -> dict[str, Any]:
        if not deepeval_available():
            return {
                "winner": None,
                "scores": None,
                "average_score": None,
                "reason": None,
                "error": "deepeval_not_installed",
                "raw_response": None,
            }

        if use_ragas or contexts:
            ctx = contexts or []
            per_model_ragas: dict[str, dict[str, float]] = {
                name: evaluate_rag_metrics_deepeval(question, answer, ground_truth, ctx)
                for name, answer in responses.items()
            }
            winner: str | None = None
            reason: str | None = None
            if len(per_model_ragas) > 1:

                def _avg(scores: dict[str, float]) -> float:
                    return sum(scores.values()) / len(scores) if scores else 0.0

                winner = max(per_model_ragas, key=lambda m: _avg(per_model_ragas[m]))
                reason = f"依 DeepEval RAG 指標，{winner} 平均分最高（{round(_avg(per_model_ragas[winner]), 3)}）。"

            return {"winner": winner, "ragas_scores": per_model_ragas, "reason": reason, "raw_response": None}

        from deepeval.test_case import LLMTestCase

        # n == 1: single-model absolute scoring across three dimensions.
        if len(responses) == 1:
            answer = next(iter(responses.values()))
            try:
                tc = LLMTestCase(input=question, actual_output=answer, expected_output=ground_truth)
                dim_scores: dict[str, int] = {}
                reasons: list[str] = []
                for key, metric in self._single_metrics():
                    metric.measure(tc)
                    dim_scores[key] = _to_five(float(metric.score or 0.0))
                    if getattr(metric, "reason", None):
                        reasons.append(str(metric.reason))
                avg = round(sum(dim_scores.values()) / len(dim_scores), 2)
                return {
                    "winner": None,
                    "scores": dim_scores,
                    "average_score": avg,
                    "reason": " ".join(reasons)[:500] or None,
                    "raw_response": None,
                }
            except Exception as exc:
                logger.error("DeepEval single-model evaluate error: %s", exc, exc_info=True)
                return {
                    "winner": None,
                    "scores": None,
                    "average_score": None,
                    "reason": None,
                    "error": str(exc),
                    "raw_response": None,
                }

        # n > 1: overall correctness per model, then pick winner / tie.
        try:
            metric = self._overall_metric()
            model_scores: dict[str, float] = {}
            model_reasons: dict[str, str] = {}
            for name, answer in responses.items():
                tc = LLMTestCase(input=question, actual_output=answer, expected_output=ground_truth)
                metric.measure(tc)
                model_scores[name] = float(metric.score or 0.0)
                model_reasons[name] = str(getattr(metric, "reason", "") or "")

            best = max(model_scores.values())
            winners = [m for m, s in model_scores.items() if best - s <= _TIE_MARGIN]
            outcome = "tie" if len(winners) > 1 else "single_winner"
            winner_legacy = winners[0] if outcome == "single_winner" else None
            reason = "DeepEval 綜合分數：" + ", ".join(f"{m} {round(s, 3)}" for m, s in model_scores.items())
            return {
                "outcome": outcome,
                "winner_model_ids": winners,
                "winner": winner_legacy,
                "reason": reason,
                "raw_response": None,
            }
        except Exception as exc:
            logger.error("DeepEval judge evaluate error: %s", exc, exc_info=True)
            return {
                "outcome": "needs_review",
                "winner_model_ids": [],
                "winner": None,
                "reason": None,
                "error": str(exc),
                "raw_response": None,
            }

    def compare_models(
        self,
        questions: list,
        ground_truths: list,
        model_responses_list: list,
        model_names: list | None = None,
        *,
        use_ragas: bool = False,
        contexts_list: list[list[str]] | None = None,
    ) -> dict[str, Any]:
        model_count = len(model_responses_list)
        if model_names is None:
            model_names = [f"Model-{i + 1}" for i in range(model_count)]

        is_single_model = model_count == 1
        results: list[dict[str, Any]] = []
        wins: dict[str, int] = dict.fromkeys(model_names, 0)
        ties: dict[str, int] = dict.fromkeys(model_names, 0)
        needs_review_count = 0
        reasons: list[str] = []
        score_accum = {"accuracy": 0.0, "completeness": 0.0, "relevance_clarity": 0.0, "average": 0.0}
        scored_count = 0
        ragas_accum: dict[str, float] = {}
        ragas_scored_count = 0

        num_samples = len(questions)
        for idx in range(num_samples):
            q = questions[idx]
            gt = ground_truths[idx]
            contexts = contexts_list[idx] if contexts_list and idx < len(contexts_list) else None
            responses = {
                name: (model_responses_list[mi][idx] if idx < len(model_responses_list[mi]) else "")
                for mi, name in enumerate(model_names)
            }
            result = self.evaluate(q, gt, responses, use_ragas=use_ragas, contexts=contexts)
            results.append(result)

            if is_single_model:
                scores = result.get("scores")
                if scores:
                    score_accum["accuracy"] += scores.get("accuracy", 0)
                    score_accum["completeness"] += scores.get("completeness", 0)
                    score_accum["relevance_clarity"] += scores.get("relevance_clarity", 0)
                    score_accum["average"] += result.get("average_score") or 0.0
                    scored_count += 1
                ragas_block = result.get("ragas_scores")
                if ragas_block:
                    for _model, metric_dict in ragas_block.items():
                        for metric_name, val in metric_dict.items():
                            ragas_accum.setdefault(metric_name, 0.0)
                            ragas_accum[metric_name] += val
                    ragas_scored_count += 1
            else:
                outcome = result.get("outcome")
                if outcome == "tie":
                    for name in result.get("winner_model_ids", []):
                        if name in ties:
                            ties[name] += 1
                elif outcome == "single_winner" or result.get("winner"):
                    winner_ids = result.get("winner_model_ids") or (
                        [result["winner"]] if result.get("winner") else []
                    )
                    matched = False
                    for name in winner_ids:
                        if name in wins:
                            wins[name] += 1
                            matched = True
                            break
                    if not matched and winner_ids:
                        needs_review_count += 1
                elif outcome == "needs_review":
                    needs_review_count += 1

            if result.get("reason"):
                reasons.append(result["reason"])

        if is_single_model and scored_count > 0:
            avg_scores = {k: round(v / scored_count, 2) for k, v in score_accum.items()}
            summary: dict[str, Any] = {
                "model_wins": wins,
                "total_samples": num_samples,
                "average_scores": avg_scores,
                "reasons": reasons,
            }
        else:
            summary = {
                "model_wins": wins,
                "model_ties": ties,
                "needs_review_count": needs_review_count,
                "total_samples": num_samples,
                "reasons": reasons,
            }

        if ragas_scored_count > 0:
            summary["ragas_average_scores"] = {
                metric: round(total / ragas_scored_count, 4) for metric, total in ragas_accum.items()
            }

        return {"results": results, "summary": summary}

    def close(self) -> None:  # parity with LLMJudgementService
        pass
