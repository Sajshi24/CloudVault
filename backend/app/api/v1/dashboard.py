from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.iam import get_current_user
from app.database.session import get_db
from app.models.file import File
from app.models.folder import Folder
from app.models.share import Share
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.schemas.file import FileResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    total_files = await db.scalar(
        select(func.count()).select_from(File).where(File.owner_id == current_user.id)
    )
    total_folders = await db.scalar(
        select(func.count()).select_from(Folder).where(
            Folder.owner_id == current_user.id, Folder.is_root.is_(False)
        )
    )
    # Count files that have an active public share link
    shared_files = await db.scalar(
        select(func.count())
        .select_from(Share)
        .join(File, Share.file_id == File.id)
        .where(File.owner_id == current_user.id, Share.access == "anyone")
    )
    recent_result = await db.execute(
        select(File)
        .where(File.owner_id == current_user.id)
        .order_by(File.created_at.desc())
        .limit(8)
    )
    recent_uploads = [FileResponse.model_validate(f) for f in recent_result.scalars().all()]

    return DashboardResponse(
        total_files=total_files or 0,
        total_folders=total_folders or 0,
        shared_files=shared_files or 0,
        storage_used=current_user.storage_used,
        storage_limit=current_user.storage_limit,
        remaining_storage=max(0, current_user.storage_limit - current_user.storage_used),
        recent_uploads=recent_uploads,
    )
