import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import FileResponse as DiskFileResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.iam import get_current_user
from app.core.config import settings
from app.database.session import get_db
from app.models.file import File
from app.models.share import Share, ACCESS_ANYONE, ACCESS_RESTRICTED
from app.models.user import User
from app.schemas.share import ShareResponse, ShareUpdateRequest
from app.storage import local_storage

router = APIRouter(prefix="/share", tags=["Shares"])


def _share_url(request: Request, token: str) -> str:
    return str(request.base_url).rstrip("/") + settings.API_PREFIX + f"/share/{token}"


def _frontend_share_url(request: Request, token: str) -> str:
    """URL that opens the CloudVault share page in the browser."""
    base = str(request.base_url).rstrip("/")
    # In production the frontend is served from the same origin.
    # In dev mode the frontend is at port 5173.
    # We emit the /share/<token> path; the SPA router handles it.
    return base + f"/share/{token}"


@router.post("/{file_id}", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
async def create_share(
    file_id: uuid.UUID,
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ShareResponse:
    result = await db.execute(select(File).where(File.id == file_id, File.owner_id == current_user.id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    result = await db.execute(select(Share).where(Share.file_id == file_id))
    existing = result.scalar_one_or_none()
    if existing is not None:
        response.status_code = status.HTTP_200_OK
        return ShareResponse(
            share_url=_share_url(request, existing.share_token),
            access=existing.access,
            created_at=existing.created_at,
        )

    share = Share(file_id=file_id, access=ACCESS_ANYONE)
    db.add(share)
    await db.commit()
    await db.refresh(share)
    return ShareResponse(
        share_url=_share_url(request, share.share_token),
        access=share.access,
        created_at=share.created_at,
    )


@router.patch("/{file_id}", response_model=ShareResponse)
async def update_share_access(
    file_id: uuid.UUID,
    body: ShareUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ShareResponse:
    """Change the access level of an existing share (anyone / restricted)."""
    if body.access not in (ACCESS_ANYONE, ACCESS_RESTRICTED):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="access must be 'anyone' or 'restricted'")

    result = await db.execute(select(File).where(File.id == file_id, File.owner_id == current_user.id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    result = await db.execute(select(Share).where(Share.file_id == file_id))
    share = result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found — create it first")

    share.access = body.access
    await db.commit()
    await db.refresh(share)
    return ShareResponse(
        share_url=_share_url(request, share.share_token),
        access=share.access,
        created_at=share.created_at,
    )


@router.get("/{token}/meta")
async def get_shared_file_meta(token: str, db: AsyncSession = Depends(get_db)) -> dict:
    """Return file metadata for a share token (no auth required for public links)."""
    result = await db.execute(select(Share).where(Share.share_token == token))
    share = result.scalar_one_or_none()
    if share is None or share.access != ACCESS_ANYONE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found or not public")

    result = await db.execute(select(File).where(File.id == share.file_id))
    file = result.scalar_one_or_none()
    if file is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return {
        "original_name": file.original_name,
        "mime_type": file.mime_type,
        "size": file.size,
        "created_at": file.created_at.isoformat(),
    }


@router.get("/{token}")
async def access_shared_file(token: str, db: AsyncSession = Depends(get_db)) -> DiskFileResponse:
    result = await db.execute(select(Share).where(Share.share_token == token))
    share = result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found")

    # Enforce access level — restricted shares are not publicly accessible
    if share.access != ACCESS_ANYONE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This file is not shared publicly")

    result = await db.execute(select(File).where(File.id == share.file_id))
    file = result.scalar_one_or_none()
    if file is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    stored_path = local_storage.get_path(file.stored_name)
    if not local_storage.file_exists(stored_path):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="File metadata exists but file is missing from storage")

    # Serve inline so browser can preview it
    return DiskFileResponse(
        path=stored_path,
        media_type=file.mime_type,
        filename=file.original_name,
        headers={"Content-Disposition": f'inline; filename="{file.original_name}"'},
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_share(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(File).where(File.id == file_id, File.owner_id == current_user.id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    result = await db.execute(select(Share).where(Share.file_id == file_id))
    share = result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found")

    await db.delete(share)
    await db.commit()
