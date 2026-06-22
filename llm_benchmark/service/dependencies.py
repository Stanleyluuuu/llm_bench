from devtools.fastapi import get_shared_object
from fastapi import Request

from llm_benchmark.runner import Runner


def get_runner(request: Request) -> Runner:
    return get_shared_object(request.app, "runner")
