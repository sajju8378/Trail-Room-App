# Multi-stage Dockerfile for Google Cloud Run Deployment
# Step 1: Build the Vite Frontend
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies needed for sharp and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Step 2: Production Container
FROM node:22-slim AS runner

WORKDIR /app

# Required runtime libraries for sharp (libvips)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm install -g tsx

# Copy built frontend assets and server codebase
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

# Cloud Run injects $PORT at runtime
CMD ["tsx", "server.ts"]
