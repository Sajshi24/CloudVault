from pydantic import BaseModel

from app.schemas.file import FileResponse


class DashboardResponse(BaseModel):
    total_files: int
    total_folders: int
    shared_files: int
    storage_used: int
    storage_limit: int
    remaining_storage: int
    recent_uploads: list[FileResponse]
