FROM python:3.12-slim

# Install Node.js and system dependencies
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all project files
COPY . .

# Install the bobshell CLI globally from the local vendor directory
RUN npm install -g ./vendor/bobshell

# Install Python dependencies from the compiled requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Bind to 0.0.0.0 and dynamically listen on the port provided by the host (Render uses $PORT, HF Spaces uses 7860/PORT)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
