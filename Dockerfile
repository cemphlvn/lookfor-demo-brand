# Multi-stage build for MAS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source
COPY src ./src
COPY data ./data

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy source and config
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/data ./data

# Copy public assets (dashboard)
COPY public ./public

# Install all deps (tsx needed for ESM)
RUN npm install

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npx", "tsx", "src/api/server.ts"]
