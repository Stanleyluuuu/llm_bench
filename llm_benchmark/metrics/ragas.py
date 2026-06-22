import contextlib
import json
import os

import requests
from datasets import Dataset
from langchain.embeddings.base import Embeddings
from langchain.llms.base import LLM
from langchain_openai import ChatOpenAI
from ragas import evaluate as ragas_evaluate
from ragas.metrics import answer_relevancy, faithfulness

from llm_benchmark.logging import logger
from llm_benchmark.settings import app_settings


class EmbeddingGenerator:
    def __init__(self, dense_model_url: str, dense_model_name: str):
        self.dense_model_url = dense_model_url
        self.dense_model_name = dense_model_name

    def get_dense_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate dense embeddings for a batch of texts in a single API call.

        Returns one vector per input text, in the same order. Previously this
        method discarded every vector except the first (``return embeddings[0]``),
        which both lost batch results and forced per-text calls.
        """
        params = {
            "input": texts,
            "model": self.dense_model_name,
            "encoding_format": "float",
        }

        headers = {"aiaas-apikey": os.getenv("AIAAS_APIKEY")}

        try:
            response = requests.post(self.dense_model_url, json=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            batch_embeddings = [item["embedding"] for item in data["data"]]
        except requests.RequestException as e:
            logger.error(f"Error making API request: {e}")
            raise

        return batch_embeddings


class RagasLLMAdapter(LLM):
    def __init__(self, llm, **kwargs):
        super().__init__(**kwargs)
        self._llm = llm

    @property
    def _llm_type(self) -> str:
        return "custom_llm"

    def _call(self, prompt: str) -> str:
        try:
            result = self._llm.invoke(prompt)
            content = result.content if hasattr(result, "content") else str(result)
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and "text" not in parsed:
                    text_parts = []
                    for value in parsed.values():
                        if isinstance(value, list):
                            text_parts.extend([str(v) for v in value])
                        elif isinstance(value, dict):
                            text_parts.append(json.dumps(value))
                        else:
                            text_parts.append(str(value))

                    if text_parts:
                        parsed["text"] = " ".join(text_parts)

                        return json.dumps(parsed)
            except Exception:
                pass

            return content

        except Exception as e:
            logger.error(f"Error calling LLM: {e}")
            return self._get_fallback_response(prompt)

    def _get_fallback_response(self, prompt: str = "") -> str:
        if "json" in prompt.lower() or "{" in prompt or "format" in prompt.lower():
            return '{"response": "Unable to generate valid response"}'

        return "Unable to generate valid response"


class RagasEmbeddingAdapter(Embeddings):
    def __init__(self, embedding_generator: EmbeddingGenerator):
        super().__init__()
        self.embedding_generator = embedding_generator

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        # Single batched request for all texts (was: one HTTP call per text).
        if not texts:
            return []

        try:
            return self.embedding_generator.get_dense_embeddings(texts)
        except Exception as e:
            logger.error(f"Error embedding documents: {e}")
            # Preserve original "unavailable -> zeros" fallback, one per text.
            return [[0.0] * app_settings.embedding.dim for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        try:
            return self.embedding_generator.get_dense_embeddings([text])[0]
        except Exception as e:
            logger.error(f"Error embedding query: {e}")

            return [0.0] * app_settings.embedding.dim


def create_ragas_llm(api_base: str, model_name: str, max_tokens: int | None = None) -> RagasLLMAdapter:
    llm = ChatOpenAI(
        model=model_name,
        base_url=api_base,
        api_key="placeholder",  # real auth via aiaas-apikey header; openai client requires non-None
        max_tokens=max_tokens,
        default_headers={"aiaas-apikey": os.getenv("AIAAS_APIKEY")},
        temperature=0,
        streaming=True,
    )

    return RagasLLMAdapter(llm)


def create_ragas_embeddings() -> RagasEmbeddingAdapter:
    embedding_generator = EmbeddingGenerator(
        dense_model_url=app_settings.embedding.url,
        dense_model_name=app_settings.embedding.name,
    )

    return RagasEmbeddingAdapter(embedding_generator)


def evaluate_rag_metrics(question: str, answer: str, ground_truth: str, contexts: list[str]) -> dict[str, float]:
    """Run faithfulness + answer_relevancy for a single (question, answer, contexts) tuple.

    Returns a flat dict, e.g. {"faithfulness": 0.8, "answer_relevancy": 0.75}.
    Returns an empty dict on failure so callers can treat missing keys as unavailable.
    """

    ragas_llm = create_ragas_llm(
        app_settings.llm_large.api_base,
        app_settings.llm_large.name,
        app_settings.llm_large.max_token,
    )
    ragas_embeddings = create_ragas_embeddings()

    ds = Dataset.from_dict(
        {
            "question": [question],
            "answer": [answer],
            "ground_truth": [ground_truth],
            "contexts": [contexts],
        }
    )

    try:
        result = ragas_evaluate(
            ds,
            metrics=[faithfulness, answer_relevancy],
            llm=ragas_llm,
            embeddings=ragas_embeddings,
        )
        scores: dict[str, float] = {}

        if hasattr(result, "to_pandas"):
            df = result.to_pandas()
            for col in ("faithfulness", "answer_relevancy"):
                if col in df.columns:
                    val = df[col].iloc[0]
                    scores[col] = round(float(val), 4) if val is not None else 0.0
        else:
            for key, val in dict(result).items():
                with contextlib.suppress(TypeError, ValueError):
                    scores[key] = round(float(val), 4)

        return scores

    except Exception as exc:
        logger.error("Ragas rag-metrics evaluation failed: %s", exc, exc_info=True)
        return {}
