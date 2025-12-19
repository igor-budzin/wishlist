# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for all workspaces
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

# Install all dependencies (including workspaces and dev dependencies)
RUN npm ci

# Copy shared package source and build it first (dependency)
COPY packages/shared ./packages/shared
RUN npm run build:shared

# Copy backend source including Prisma schema
COPY packages/backend ./packages/backend

# Generate Prisma client
RUN npx prisma generate --schema=./packages/backend/prisma/schema.prisma

# Build backend TypeScript
RUN npm run build:backend

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Copy built backend files
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Copy Prisma schema and migrations
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose backend port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set working directory to backend
WORKDIR /app/packages/backend

# Run database migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
