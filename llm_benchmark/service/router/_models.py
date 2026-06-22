import re

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from llm_benchmark.schema import ValidateRequest

models_router = APIRouter()


@models_router.post("/models/validate", summary="驗證自訂模型 base URL 是否可達")
async def models_validate(body: ValidateRequest) -> JSONResponse:
    """Best-effort connectivity check.

    The user is expected to provide a URL ending with ``/v1``.
    We strip ``/v1`` (with optional trailing slash) to derive the server
    root, then probe ``/ping`` and ``/health`` against the root.
    """
    raw = body.base_url.rstrip("/")
    if not raw.startswith(("http://", "https://")):

        return JSONResponse(
            {"ok": False, "reachable_via": None, "error": "base_url must start with http(s)://"},
            status_code=200,
        )

    base_url = re.sub(r"/v1/?$", "", raw)
    last_error = ""
    async with httpx.AsyncClient(timeout=5.0, verify=False) as client:
        for path, label in (("/ping", "ping"), ("/health", "health")):
            try:
                resp = await client.get(f"{base_url}{path}")

                if 200 <= resp.status_code < 300:
                    return JSONResponse({"ok": True, "reachable_via": label, "error": None})

                last_error = f"{path} returned {resp.status_code}"
                
            except Exception as exc:
                last_error = f"{path}: {exc}"

    return JSONResponse({"ok": False, "reachable_via": None, "error": last_error})
