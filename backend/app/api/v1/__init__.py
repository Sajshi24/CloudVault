from fastapi import APIRouter

from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.files import router as files_router
from app.api.v1.folders import router as folders_router
from app.api.v1.health import router as health_router
from app.api.v1.iam import router as iam_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.shares import router as shares_router
from app.api.v1.users import router as users_router

router = APIRouter()
router.include_router(health_router, tags=["Health"])
router.include_router(iam_router)
router.include_router(users_router)
router.include_router(folders_router)
router.include_router(files_router)
router.include_router(dashboard_router)
router.include_router(shares_router)
router.include_router(notifications_router)
