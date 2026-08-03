from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

_pwd = PasswordHash.recommended()


def hash_password(plain: str) -> str:
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return jwt.encode({"sub": subject, "exp": expire}, settings.JWT_SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> str:
    """Returns the subject (user id) or raises jwt.PyJWTError."""
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    return payload["sub"]
