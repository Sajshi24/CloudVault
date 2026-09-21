from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.iam import get_current_user
from app.core.security import hash_password, verify_password
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import (
    PasswordChangeRequest,
    StorageUsageResponse,
    UserResponse,
    UserUpdateRequest,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    body: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    current_user.full_name = body.full_name
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")

    current_user.password_hash = hash_password(body.new_password)
    await db.commit()


@router.get("/me/storage", response_model=StorageUsageResponse)
async def get_storage_usage(current_user: User = Depends(get_current_user)) -> StorageUsageResponse:
    remaining = max(0, current_user.storage_limit - current_user.storage_used)
    percentage = round(current_user.storage_used / current_user.storage_limit * 100, 2) if current_user.storage_limit else 0.0
    return StorageUsageResponse(
        storage_used=current_user.storage_used,
        storage_limit=current_user.storage_limit,
        remaining_storage=remaining,
        percentage_used=percentage,
    )
