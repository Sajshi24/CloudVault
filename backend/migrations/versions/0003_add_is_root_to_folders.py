"""add is_root to folders

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-03
"""
from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: str = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("folders", sa.Column("is_root", sa.Boolean(), nullable=False, server_default="false"))
    op.create_index(
        "ix_folders_one_root_per_user",
        "folders",
        ["owner_id"],
        unique=True,
        postgresql_where=sa.text("is_root = true"),
    )


def downgrade() -> None:
    op.drop_index("ix_folders_one_root_per_user", table_name="folders")
    op.drop_column("folders", "is_root")
