from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.v1 import router as v1_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Secure cloud-based file storage and sharing platform.",
    version=settings.APP_VERSION,
)

app.include_router(v1_router, prefix=settings.API_PREFIX)


@app.get("/", summary="Root", tags=["Root"])
async def root() -> JSONResponse:
    return JSONResponse(content={"message": f"Welcome to {settings.APP_NAME}"})


logger.info("CloudVault backend started")
