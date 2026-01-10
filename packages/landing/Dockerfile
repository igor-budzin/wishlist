# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for all workspaces
COPY package.json package-lock.json ./
COPY packages/landing/package.json ./packages/landing/

# Install all dependencies (including workspaces)
RUN npm ci

# Copy root tsconfig (needed for builds)
COPY tsconfig.json ./

# Copy landing source
COPY packages/landing ./packages/landing

# Build landing with Astro
RUN npm run build:landing

# Stage 2: Serve with nginx + Brotli support
FROM fholzer/nginx-brotli:latest

# Copy custom nginx configuration
COPY packages/landing/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/packages/landing/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx (base image already has nginx as ENTRYPOINT)
CMD ["-g", "daemon off;"]
