from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.iam import router as iam_router

router = APIRouter()
router.include_router(health_router, tags=["Health"])
router.include_router(iam_router)
