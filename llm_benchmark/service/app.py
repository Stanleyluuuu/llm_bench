from pathlib import Path

from devtools.fastapi import set_shared_object
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from llm_benchmark.runner import Runner
from llm_benchmark.service.router.backend import backend_router

_DIST_DIR = Path(__file__).parent.parent.parent / "frontend" / "dist"


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Model Evaluation API",
        description="用於自動化驗證與評估生成式 AI 模型的 API 服務",
        version="1.0.0",
    )

    runner = Runner()

    set_shared_object(app, "runner", runner)

    app.include_router(backend_router)

    # Serve React SPA — must come after API routes
    if _DIST_DIR.exists():
        app.mount("/assets", StaticFiles(directory=str(_DIST_DIR / "assets")), name="assets")

        @app.get("/", include_in_schema=False)
        async def spa_index() -> FileResponse:
            return FileResponse(str(_DIST_DIR / "index.html"))

        @app.get("/{full_path:path}", include_in_schema=False)
        async def spa_fallback(full_path: str) -> FileResponse:
            # Let API 404s bubble through; serve index.html for everything else
            candidate = _DIST_DIR / full_path
            if candidate.is_file():
                return FileResponse(str(candidate))

            return FileResponse(str(_DIST_DIR / "index.html"))

    return app
