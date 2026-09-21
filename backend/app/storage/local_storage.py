import uuid
from pathlib import Path

from app.core.config import settings

_upload_dir = Path(settings.UPLOAD_DIRECTORY)
_upload_dir.mkdir(parents=True, exist_ok=True)


def save_file(data: bytes, extension: str) -> Path:
    """Write data to disk under a UUID filename and return its path."""
    stored_path = _upload_dir / f"{uuid.uuid4()}{extension}"
    stored_path.write_bytes(data)
    return stored_path


def delete_file(stored_path: Path) -> None:
    """Delete a file from disk. Raises FileNotFoundError if it does not exist."""
    stored_path.unlink()


def file_exists(stored_path: Path) -> bool:
    """Return True if the file exists on disk."""
    return stored_path.is_file()


def get_path(stored_name: str) -> Path:
    """Resolve a stored filename to its full filesystem path."""
    return _upload_dir / stored_name
