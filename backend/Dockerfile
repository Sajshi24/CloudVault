# 1. Use an official Python base image
FROM python:3.13-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 4. Configure uv
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# 5. Copy dependency files first
COPY pyproject.toml uv.lock ./

# 6. Install project dependencies without dev dependencies
RUN uv sync --frozen --no-dev --no-install-project

# 7. Copy the backend application code
COPY app/ ./app/
COPY migrations/ ./migrations/
COPY alembic.ini ./

# 8. Add the virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# 9. Expose the FastAPI port
EXPOSE 8000

# 10. Start the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]