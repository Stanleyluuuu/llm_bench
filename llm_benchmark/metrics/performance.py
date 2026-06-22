from typing import Any


def compute_time_for_results(results_by_model: dict[str, dict]) -> dict[str, dict[str, Any]]:
    perf_results = {}
    for model_id, result in results_by_model.items():
        response_times = result.get("response_time", [])
        if not response_times:
            statistic = {}
        else:
            statistic = {
                "avg_response_time": sum(response_times) / len(response_times),
                "total_response_time": sum(response_times),
                "min_response_time": min(response_times),
                "max_response_time": max(response_times),
            }

        perf_results[model_id] = statistic

    return perf_results
