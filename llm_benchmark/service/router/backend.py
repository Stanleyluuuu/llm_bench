from fastapi import APIRouter

from llm_benchmark.service.router._evaluate import evaluate_router
from llm_benchmark.service.router._history import history_router
from llm_benchmark.service.router._models import models_router
from llm_benchmark.service.router._projects import projects_router
from llm_benchmark.service.router._runs import runs_router

backend_router = APIRouter(prefix="/api", tags=["API"])

backend_router.include_router(projects_router)
backend_router.include_router(models_router)
backend_router.include_router(evaluate_router)
backend_router.include_router(history_router)
backend_router.include_router(runs_router)
