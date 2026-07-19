FROM python:3.12-slim

# Install Node.js and IBM BOB CLI
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g @ibm/bob && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN pip install uv

RUN uv sync

EXPOSE 10000

CMD ["uv","run","uvicorn","main:app","--host","0.0.0.0","--port","10000"]
