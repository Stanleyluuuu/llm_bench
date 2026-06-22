"""DeepEval-based RAG metric scoring.

A drop-in alternative to :func:`llm_benchmark.metrics.ragas.evaluate_rag_metrics`
that uses `deepeval <https://github.com/confident-ai/deepeval>`_ instead of the
hand-written Ragas pipeline. It returns the same flat ``{metric: score}`` dict
shape so callers can swap engines without changing downstream code.

Both implementations are kept on purpose so their outputs can be compared.
"""

from __future__ import annotations

from llm_benchmark.logging import logger

from .deepeval_model import DeepEvalLLM, deepeval_available


def evaluate_rag_metrics_deepeval(
    question: str,
    answer: str,
    ground_truth: str,
    contexts: list[str],
) -> dict[str, float]:
    """Run DeepEval's Faithfulness + AnswerRelevancy for one sample.

    Mirrors the return contract of the hand-written ``evaluate_rag_metrics``:
    a flat dict (e.g. ``{"faithfulness": 0.8, "answer_relevancy": 0.75}``),
    and an empty dict on failure so missing keys read as "unavailable".
    """
    if not deepeval_available():
        logger.error("DeepEval is not installed; install the 'deepeval' extra to use this engine.")
        return {}

    try:
        from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric
        from deepeval.test_case import LLMTestCase
    except Exception as exc:  # pragma: no cover - import guard
        logger.error("DeepEval import failed: %s", exc, exc_info=True)
        return {}

    model = DeepEvalLLM()
    # Faithfulness/ContextualRelevancy need retrieval_context; fall back to the
    # ground truth as context when the caller supplied none.
    retrieval_context = contexts or [ground_truth]

    test_case = LLMTestCase(
        input=question,
        actual_output=answer,
        expected_output=ground_truth,
        retrieval_context=retrieval_context,
    )

    scores: dict[str, float] = {}
    try:
        faithfulness = FaithfulnessMetric(model=model, include_reason=False, async_mode=False)
        faithfulness.measure(test_case)
        if faithfulness.score is not None:
            scores["faithfulness"] = round(float(faithfulness.score), 4)
    except Exception as exc:
        logger.error("DeepEval faithfulness failed: %s", exc, exc_info=True)

    try:
        relevancy = AnswerRelevancyMetric(model=model, include_reason=False, async_mode=False)
        relevancy.measure(test_case)
        if relevancy.score is not None:
            scores["answer_relevancy"] = round(float(relevancy.score), 4)
    except Exception as exc:
        logger.error("DeepEval answer_relevancy failed: %s", exc, exc_info=True)

    return scores
