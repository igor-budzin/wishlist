# ============================================
# DEPRECATED: Frontend-only Dockerfile
# ============================================
# This Dockerfile is DEPRECATED and not used in the default deployment.
#
# The recommended deployment uses packages/backend/Dockerfile which builds
# BOTH frontend and backend into a single unified image. Express serves the
# frontend static files along with the API.
#
# This file is kept for reference if you need to deploy frontend separately
# (e.g., to a CDN or static hosting service like Vercel/Netlify).
#
# For default deployment, see: packages/backend/Dockerfile
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for all workspaces
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/

# Install all dependencies (including workspaces)
RUN npm ci

# Copy root tsconfig (needed for builds)
COPY tsconfig.json ./

# Copy shared package source and build it first (dependency)
COPY packages/shared ./packages/shared
RUN npm run build:shared

# Copy frontend source
COPY packages/frontend ./packages/frontend

# Declare build arguments for Vite environment variables
ARG VITE_API_URL

# Set as environment variable so Vite can access during build
ENV VITE_API_URL=$VITE_API_URL

# Build frontend with Vite
RUN npm run build:frontend

# Stage 2: Serve with nginx + Brotli support
FROM fholzer/nginx-brotli:latest

# Copy custom nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["-g", "daemon off;"]
