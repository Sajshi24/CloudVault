import uuid
from pathlib import Path
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse as DiskFileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.iam import get_current_user, get_optional_user
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.file import File
from app.models.folder import Folder
from app.models.user import User
from app.schemas.file import FileRenameRequest, FileResponse
from app.storage import local_storage

router = APIRouter(prefix="/files", tags=["Files"])


async def _get_owned_file(file_id: uuid.UUID, user: User, db: AsyncSession) -> File:
    result = await db.execute(select(File).where(File.id == file_id, File.owner_id == user.id))
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return record


@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    folder_id: uuid.UUID = Form(...),
    file: UploadFile = ...,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> File:
    result = await db.execute(
        select(Folder).where(Folder.id == folder_id, Folder.owner_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty")

    extension = Path(file.filename or "").suffix
    stored_path = local_storage.save_file(data, extension)

    record = File(
        original_name=file.filename or stored_path.name,
        stored_name=stored_path.name,
        mime_type=file.content_type or "application/octet-stream",
        size=len(data),
        folder_id=folder_id,
        owner_id=current_user.id,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("", response_model=list[FileResponse])
async def list_files(
    folder_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[File]:
    result = await db.execute(
        select(File).where(File.folder_id == folder_id, File.owner_id == current_user.id)
    )
    return list(result.scalars().all())


@router.get("/search", response_model=list[FileResponse])
async def search_files(
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[File]:
    result = await db.execute(
        select(File).where(File.owner_id == current_user.id, File.original_name.ilike(f"%{q}%"))
    )
    return list(result.scalars().all())


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> File:
    return await _get_owned_file(file_id, current_user, db)


@router.get("/{file_id}/preview")
async def preview_file(
    file_id: uuid.UUID,
    token: Optional[str] = Query(default=None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> DiskFileResponse:
    """Stream the file inline for browser preview.

    Accepts auth via:
    - Authorization: Bearer <token> header (standard API calls)
    - ?token=<jwt> query param  (browser <img>/<iframe> embedding)
    """
    user = current_user
    # If no header auth, fall back to query param
    if user is None and token:
        try:
            user_id = decode_access_token(token)
        except jwt.PyJWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    record = await _get_owned_file(file_id, user, db)
    stored_path = local_storage.get_path(record.stored_name)

    if not local_storage.file_exists(stored_path):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="File metadata exists but file is missing from storage")

    return DiskFileResponse(
        path=stored_path,
        media_type=record.mime_type,
        filename=record.original_name,
        headers={"Content-Disposition": f'inline; filename="{record.original_name}"'},
    )


@router.get("/{file_id}/download")
async def download_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DiskFileResponse:
    record = await _get_owned_file(file_id, current_user, db)
    stored_path = local_storage.get_path(record.stored_name)

    if not local_storage.file_exists(stored_path):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="File metadata exists but file is missing from storage")

    return DiskFileResponse(
        path=stored_path,
        media_type=record.mime_type,
        filename=record.original_name,
        headers={"Content-Disposition": f'attachment; filename="{record.original_name}"'},
    )


@router.patch("/{file_id}", response_model=FileResponse)
async def rename_file(
    file_id: uuid.UUID,
    body: FileRenameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> File:
    record = await _get_owned_file(file_id, current_user, db)
    record.original_name = body.original_name
    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    record = await _get_owned_file(file_id, current_user, db)
    stored_path = local_storage.get_path(record.stored_name)

    await db.delete(record)
    await db.commit()

    if local_storage.file_exists(stored_path):
        local_storage.delete_file(stored_path)
