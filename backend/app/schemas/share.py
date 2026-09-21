from datetime import datetime

from pydantic import BaseModel


class ShareResponse(BaseModel):
    share_url: str
    access: str
    created_at: datetime


class ShareUpdateRequest(BaseModel):
    access: str  # "anyone" or "restricted"
