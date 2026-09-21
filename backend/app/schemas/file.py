import uuid
from datetime import datetime

from pydantic import BaseModel


class FileResponse(BaseModel):
    id: uuid.UUID
    original_name: str
    mime_type: str
    size: int
    folder_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class FileRenameRequest(BaseModel):
    original_name: str
