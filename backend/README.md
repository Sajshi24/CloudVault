# CloudVault Backend

Secure cloud-based file storage and sharing platform.

## Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/) package manager
- PostgreSQL

## Setup

### 1. Install dependencies

```bash
cd backend
uv sync
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` and any other values.

### 3. Activate the virtual environment

```bash
# uv manages the venv automatically, but to activate it manually:
source .venv/bin/activate       # Linux / macOS
.venv\Scripts\activate          # Windows
```

## Running the development server

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |
| `http://localhost:8000/` | Root endpoint |
| `http://localhost:8000/api/v1/health` | Health check |

## Database migrations

```bash
# Generate a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback one step
uv run alembic downgrade -1
```

## Running tests

```bash
uv run pytest
```
