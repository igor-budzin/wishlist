# Stage 1: Build shared package
FROM node:20-alpine AS shared-builder

WORKDIR /app

# Copy package files for all workspaces
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN npm ci

# Copy root tsconfig (needed for shared package build)
COPY tsconfig.json ./

# Copy shared package source and build it first (dependency)
COPY packages/shared ./packages/shared
RUN npm run build:shared

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN npm ci

# Copy shared package build output
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist

# Copy frontend source
COPY packages/frontend ./packages/frontend

# Build frontend with VITE_API_URL (empty for same-origin)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build:frontend

# Stage 3: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN npm ci

# Copy shared package build output
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
COPY packages/shared ./packages/shared

# Copy backend source including Prisma schema
COPY packages/backend ./packages/backend

# Generate Prisma client
RUN npx prisma generate --schema=./packages/backend/prisma/schema.prisma

# Build backend TypeScript
RUN npm run build:backend

# Stage 4: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

# Install only production dependencies
RUN npm ci --omit=dev

# Remove unnecessary files from node_modules (tests, docs, source maps, etc.)
RUN wget -qO- https://gobinaries.com/tj/node-prune | sh && \
    node-prune /app/node_modules && \
    rm /usr/local/bin/node-prune

# Copy built shared package
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=shared-builder /app/packages/shared/package.json ./packages/shared/

# Copy built backend files
COPY --from=backend-builder /app/packages/backend/dist ./packages/backend/dist

# Copy Prisma schema and migrations
COPY --from=backend-builder /app/packages/backend/prisma ./packages/backend/prisma

# Copy generated Prisma client
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built frontend files
COPY --from=frontend-builder /app/packages/frontend/dist ./packages/frontend/dist

# Remove unnecessary Prisma query engine binaries (keep only linux-musl-openssl for Alpine)
RUN find /app/node_modules/.prisma -name 'libquery_engine-*' ! -name '*linux-musl-openssl*' -delete && \
    find /app/node_modules/@prisma -name 'libquery_engine-*' ! -name '*linux-musl-openssl*' -delete && \
    find /app/node_modules/.prisma -name 'query-engine-*' ! -name '*linux-musl-openssl*' -delete && \
    find /app/node_modules/@prisma -name 'query-engine-*' ! -name '*linux-musl-openssl*' -delete

# Expose backend port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set working directory to backend
WORKDIR /app/packages/backend

# Run database migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
