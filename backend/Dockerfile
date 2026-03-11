FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (must be root)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m appuser

# Copy requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Switch to non-root user
USER appuser

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]