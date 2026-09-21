import uuid
from datetime import datetime

from pydantic import BaseModel


class FolderCreateRequest(BaseModel):
    name: str
    parent_folder_id: uuid.UUID | None = None


class FolderRenameRequest(BaseModel):
    name: str


class FolderResponse(BaseModel):
    id: uuid.UUID
    name: str
    owner_id: uuid.UUID
    parent_folder_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
