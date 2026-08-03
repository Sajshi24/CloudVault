from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health", summary="Health check")
async def health() -> JSONResponse:
    return JSONResponse(content={"status": "healthy"})
