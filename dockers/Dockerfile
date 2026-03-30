FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.30.0" \
    "sqlalchemy>=2.0.0" \
    "psycopg2-binary>=2.9.0" \
    "pydantic>=2.0.0" \
    "pydantic-settings>=2.0.0" \
    "email-validator>=2.0.0"

# Copy application source
COPY services/backend/src /app/src

# Add src/ to PYTHONPATH so `backend` package is importable
ENV PYTHONPATH=/app/src

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
