import secrets
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

_TOKEN_BYTES = 32

# Access levels
ACCESS_ANYONE = "anyone"      # Anyone with the link can view
ACCESS_RESTRICTED = "restricted"  # Owner only (link disabled)


class Share(Base):
    __tablename__ = "shares"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    share_token: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True, default=lambda: secrets.token_urlsafe(_TOKEN_BYTES)
    )
    access: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ACCESS_ANYONE
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
