FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Copy Python requirements
COPY --chown=appuser:appuser requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY --chown=appuser:appuser . .

# Install development dependencies
COPY --chown=appuser:appuser requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
