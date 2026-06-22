from typing import Any, Literal

from pydantic import BaseModel, Field

from llm_benchmark.adapters.llm_vlm import LLMVLMAdapter
from llm_benchmark.logging import logger
from llm_benchmark.metrics.ragas import evaluate_rag_metrics
from llm_benchmark.settings import app_settings

# ==========================================
# 新增：給 n=1 時的單模型評估配置
# ==========================================

_SINGLE_SYSTEM_PROMPT = """你是一位嚴格、客觀、專業的 AI 回答評審。你的任務是根據【原始問題】與【期望答案】，獨立且全面地評估單一模型回覆的品質，並給出多維度的客觀分數。

## 評分維度（1-5 分，5 分為滿分）

1. 準確性（Accuracy/Faithfulness）：是否有事實錯誤、幻覺，或與期望答案衝突。
2. 完整性（Completeness）：是否涵蓋期望答案中的關鍵資訊，有無重大遺漏。
3. 相關與流暢度（Relevance & Clarity）：是否切題、無多餘內容，且語言通順、結構清晰。

## 評審原則

- 準確性優先：若某模型有事實錯誤或幻覺，即使其他維度表現好，準確性也應大幅扣分。
- 以【期望答案】為參考標準，但允許模型用不同表達方式達到同等或更好的效果。
- 請嚴格遵守 1-5 分的評分標準：
  - 5 分：完美符合期望，無瑕疵。
  - 4 分：符合期望，但有細微優化空間。
  - 3 分：核心意思表達正確，但缺乏部分細節或有冗餘。
  - 2 分：有明顯的事實錯誤、重大遺漏或答非所問。
  - 1 分：完全錯誤、嚴重的幻覺，或毫無關聯。

## 輸出

你必須對三個維度分別給出 1-5 的整數分數，並計算出總平均分，最後用一到兩句話給出整體分析報告。輸出格式由系統強制約束。"""


class _SingleJudgeResult(BaseModel):
    accuracy_score: int = Field(description="準確性分數（1-5整數）", ge=1, le=5)
    completeness_score: int = Field(description="完整性分數（1-5整數）", ge=1, le=5)
    relevance_clarity_score: int = Field(description="相關與流暢度分數（1-5整數）", ge=1, le=5)
    average_score: float = Field(description="三項分數的平均值（四捨五入至小數點後兩位）")
    analysis: str = Field(description="整體的評測分析報告，一到兩句簡短陳述")


_SINGLE_RESPONSE_FORMAT: dict[str, Any] = {
    "type": "json_schema",
    "json_schema": {
        "name": "single_judge_result",
        "schema": _SingleJudgeResult.model_json_schema(),
    },
}


_SYSTEM_PROMPT = """你是一位嚴格、客觀、專業的 AI 回答評審。你的任務是根據【原始問題】與【期望答案】，比較多個模型回覆的品質，選出最優者或判定平手。

## 評分維度（依重要性排序）

1. 準確性（最高權重）：是否有事實錯誤、幻覺，或與期望答案衝突
2. 完整性：是否涵蓋期望答案中的關鍵資訊，有無重大遺漏
3. 相關性：是否切題，有無多餘或離題內容
4. 清晰度與邏輯：語言通順度、結構清晰度、可理解性
5. 簡潔性：在完整的前提下是否避免冗長
6. 額外價值：是否提供超越期望答案的有用補充或洞見
7. 使用者體驗：語氣、自然度、閱讀舒適度

## 評審原則

- 準確性優先：若某模型有事實錯誤或幻覺，即使其他維度表現好，也應大幅扣分。
- 以【期望答案】為參考標準，但允許模型用不同表達方式達到同等或更好的效果。
- 保持客觀，不受回覆長度、語氣華麗程度影響判斷。
- 僅根據提供的內容評分，不臆測未提供的資訊。
- **平手規則**：若多個模型的回答品質實質相同（內容等效、均無明顯錯誤），請回傳 outcome="tie" 並在 winner_model_ids 中列出所有平手模型，不要被迫二選一。

## 輸出

你必須選出最優模型或判定平手，並用一到兩句話說明決定性原因。輸出格式由系統強制約束。"""


class _JudgeResult(BaseModel):
    outcome: Literal["single_winner", "tie"] = Field(
        description="single_winner 表示有唯一勝者；tie 表示多個模型品質實質相同、平手"
    )
    winner_model_ids: list[str] = Field(
        description="勝出模型清單（outcome=single_winner 時填一個模型名稱，tie 時列出所有平手模型名稱）"
    )
    rationale: str = Field(description="決定性原因，一到兩句")


_RESPONSE_FORMAT: dict[str, Any] = {
    "type": "json_schema",
    "json_schema": {
        "name": "judge_result_v2",
        "schema": _JudgeResult.model_json_schema(),
    },
}

_DASH_CHARS = ("\u2010", "\u2011", "\u2012", "\u2013", "\u2014", "\u2015")


def _build_user_prompt(question: str, expected_answer: str, responses: dict[str, str]) -> str:
    blocks = "\n\n".join(f"模型 {name}:\n{text}" for name, text in responses.items())
    return f"""【原始問題】
{question}

【期望答案】
{expected_answer}

【模型數量】
{len(responses)}

【模型回覆】
{blocks}"""


class LLMJudgementService:
    def __init__(
        self,
        api_base: str = app_settings.llm_large.api_base,
        name: str = app_settings.llm_large.name,
    ) -> None:
        self._adapter = LLMVLMAdapter(api_base=api_base, name=name)

    def evaluate(
        self,
        question: str,
        ground_truth: str,
        responses: dict[str, str],
        *,
        use_ragas: bool = False,
        contexts: list[str] | None = None,
    ) -> dict[str, Any]:

        if use_ragas or contexts:
            ctx = contexts or []
            per_model_ragas: dict[str, dict[str, float]] = {}
            for model_name, answer in responses.items():
                per_model_ragas[model_name] = evaluate_rag_metrics(
                    question=question,
                    answer=answer,
                    ground_truth=ground_truth,
                    contexts=ctx,
                )

            winner: str | None = None
            reason: str | None = None
            if len(per_model_ragas) > 1:

                def _avg(scores: dict[str, float]) -> float:
                    return sum(scores.values()) / len(scores) if scores else 0.0

                winner = max(per_model_ragas, key=lambda m: _avg(per_model_ragas[m]))
                best = per_model_ragas[winner]
                reason = f"依 Ragas 指標，{winner} 表現最佳（平均分 {round(_avg(best), 3)}）。"

            return {
                "winner": winner,
                "ragas_scores": per_model_ragas,
                "reason": reason,
                "raw_response": None,
            }

        user_prompt = _build_user_prompt(question, ground_truth, responses)

        # n == 1：單模型絕對品質評分
        if len(responses) == 1:
            try:
                raw = self._adapter.response(
                    system_prompt=_SINGLE_SYSTEM_PROMPT,
                    user_prompt=user_prompt,
                    response_format=_SINGLE_RESPONSE_FORMAT,
                )
                result = _SingleJudgeResult.model_validate_json(raw)

                return {
                    "winner": None,
                    "scores": {
                        "accuracy": result.accuracy_score,
                        "completeness": result.completeness_score,
                        "relevance_clarity": result.relevance_clarity_score,
                    },
                    "average_score": result.average_score,
                    "reason": result.analysis,
                    "raw_response": raw,
                }

            except Exception as exc:
                logger.error("LLM judge single-model evaluate error: %s", exc, exc_info=True)
                return {
                    "winner": None,
                    "scores": None,
                    "average_score": None,
                    "reason": None,
                    "error": str(exc),
                    "raw_response": None,
                }

        # n > 1：多模型對比，選出勝出者或判定平手
        try:
            raw = self._adapter.response(
                system_prompt=_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                response_format=_RESPONSE_FORMAT,
            )
            result = _JudgeResult.model_validate_json(raw)
            # backward-compat: 'winner' = first winner_model_id when single_winner
            winner_legacy = (
                result.winner_model_ids[0] if result.outcome == "single_winner" and result.winner_model_ids else None
            )
            return {
                "outcome": result.outcome,
                "winner_model_ids": result.winner_model_ids,
                "winner": winner_legacy,
                "reason": result.rationale,
                "raw_response": raw,
            }
        except Exception as exc:
            logger.error("LLM judge evaluate error: %s", exc, exc_info=True)
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
        needs_review_count: int = 0
        reasons: list[str] = []
        # 單模型模式：額外累加各維度分數，最後計算全樣本平均
        score_accum: dict[str, float] = {"accuracy": 0.0, "completeness": 0.0, "relevance_clarity": 0.0, "average": 0.0}
        scored_count: int = 0
        # Ragas 模式：跨樣本累加各指標分數
        ragas_accum: dict[str, float] = {}
        ragas_scored_count: int = 0

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
                # 單模型：累加分數，不計 winner
                scores = result.get("scores")
                if scores:
                    score_accum["accuracy"] += scores.get("accuracy", 0)
                    score_accum["completeness"] += scores.get("completeness", 0)
                    score_accum["relevance_clarity"] += scores.get("relevance_clarity", 0)
                    score_accum["average"] += result.get("average_score") or 0.0
                    scored_count += 1
                # Ragas 模式下累加 ragas_scores
                ragas_block = result.get("ragas_scores")
                if ragas_block:
                    for _model, metric_dict in ragas_block.items():
                        for metric_name, val in metric_dict.items():
                            ragas_accum.setdefault(metric_name, 0.0)
                            ragas_accum[metric_name] += val
                    ragas_scored_count += 1
            else:
                # 多模型：統計勝出次數或平手
                outcome = result.get("outcome")
                if outcome == "tie":
                    # Task 3: judge declared tie — credit all tied models
                    for wid in result.get("winner_model_ids", []):
                        wid_norm = wid
                        for ch in _DASH_CHARS:
                            wid_norm = wid_norm.replace(ch, "-")
                        for name in model_names:
                            if name in wid_norm:
                                ties[name] += 1
                                break
                elif outcome == "single_winner" or result.get("winner"):
                    # new schema or legacy winner string
                    winner_ids: list[str] = result.get("winner_model_ids") or (
                        [result["winner"]] if result.get("winner") else []
                    )
                    matched = False
                    for wid in winner_ids:
                        wid_norm = wid
                        for ch in _DASH_CHARS:
                            wid_norm = wid_norm.replace(ch, "-")
                        for name in model_names:
                            if name in wid_norm:
                                wins[name] += 1
                                matched = True
                                break
                        if matched:
                            break
                    if not matched and winner_ids:
                        # Task 7: winner ID not recognised — flag for review
                        logger.warning(
                            "LLM judge returned unrecognised winner_model_ids=%s; model_names=%s",
                            winner_ids,
                            model_names,
                        )
                        needs_review_count += 1
                elif outcome == "needs_review":
                    needs_review_count += 1

            if result.get("reason"):
                reasons.append(result["reason"])

        if is_single_model and scored_count > 0:
            avg_scores = {k: round(v / scored_count, 2) for k, v in score_accum.items()}
            summary: dict[str, Any] = {
                "model_wins": wins,  # 全部為 0，保持格式相容
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

        # 若有 Ragas 分數，附加到 summary
        if ragas_scored_count > 0:
            summary["ragas_average_scores"] = {
                metric: round(total / ragas_scored_count, 4) for metric, total in ragas_accum.items()
            }

        return {"results": results, "summary": summary}

    def close(self) -> None:
        self._adapter.close()
