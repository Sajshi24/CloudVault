import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.iam import get_current_user
from app.database.session import get_db
from app.models.folder import Folder
from app.models.user import User
from app.schemas.folder import FolderCreateRequest, FolderRenameRequest, FolderResponse

router = APIRouter(prefix="/folders", tags=["Folders"])


async def _get_owned_folder(folder_id: uuid.UUID, user: User, db: AsyncSession) -> Folder:
    result = await db.execute(select(Folder).where(Folder.id == folder_id, Folder.owner_id == user.id))
    folder = result.scalar_one_or_none()
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return folder


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    body: FolderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Folder:
    if body.parent_folder_id is not None:
        await _get_owned_folder(body.parent_folder_id, current_user, db)

    folder = Folder(name=body.name, owner_id=current_user.id, parent_folder_id=body.parent_folder_id)
    db.add(folder)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A folder with this name already exists here")
    await db.refresh(folder)
    return folder


@router.get("", response_model=list[FolderResponse])
async def list_folders(
    parent_folder_id: uuid.UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Folder]:
    result = await db.execute(
        select(Folder).where(Folder.owner_id == current_user.id, Folder.parent_folder_id == parent_folder_id)
    )
    return list(result.scalars().all())


@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Folder:
    return await _get_owned_folder(folder_id, current_user, db)


@router.patch("/{folder_id}", response_model=FolderResponse)
async def rename_folder(
    folder_id: uuid.UUID,
    body: FolderRenameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Folder:
    folder = await _get_owned_folder(folder_id, current_user, db)
    folder.name = body.name
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A folder with this name already exists here")
    await db.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    folder = await _get_owned_folder(folder_id, current_user, db)
    if folder.is_root:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Root folder cannot be deleted")
    await db.delete(folder)
    await db.commit()
