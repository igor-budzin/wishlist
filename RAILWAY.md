# Railway Deployment Guide

This guide explains how to deploy the Wishlist application to Railway. Railway will build the Docker image directly from the repository, eliminating the need for GitHub Actions to build and push images.

## Architecture

**Single Service Deployment:**

- Railway builds the Docker image using `packages/backend/Dockerfile`
- The image includes both backend API and frontend static files
- Express serves both `/api/*` routes and frontend assets from the same domain
- Benefits: No CORS issues, simplified deployment, better session handling

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your repository must be pushed to GitHub
3. **Railway CLI** (optional): Install for local testing
   ```bash
   npm install -g @railway/cli
   railway login
   ```

## Initial Setup

### 1. Create New Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your `wishlist` repository

### 2. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database and generate credentials
4. The `DATABASE_URL` will be automatically available to your service

### 3. Configure Service Settings

#### Build Configuration

Railway will automatically detect `railway.toml` at the repository root. The configuration is:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "packages/backend/Dockerfile"

[build.buildArgs]
VITE_API_URL = ""

[deploy]
startCommand = "sh -c 'cd /app/packages/backend && npx prisma migrate deploy && node dist/server.js'"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

**What this does:**

- Uses Dockerfile at `packages/backend/Dockerfile`
- Sets `VITE_API_URL=""` for same-origin API requests
- Runs database migrations on startup
- Health check endpoint: `/health`
- Automatic restart on failure (max 10 retries)

#### Environment Variables

In Railway dashboard, go to your service → **"Variables"** tab and add:

| Variable               | Value                       | Description                  |
| ---------------------- | --------------------------- | ---------------------------- |
| `NODE_ENV`             | `production`                | Production environment       |
| `SESSION_SECRET`       | (generate random 32+ chars) | Session encryption key       |
| `DATABASE_URL`         | (auto-generated)            | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID`     | (from Google Console)       | OAuth Google client ID       |
| `GOOGLE_CLIENT_SECRET` | (from Google Console)       | OAuth Google secret          |
| `GITHUB_CLIENT_ID`     | (from GitHub Settings)      | OAuth GitHub client ID       |
| `GITHUB_CLIENT_SECRET` | (from GitHub Settings)      | OAuth GitHub secret          |
| `BACKEND_URL`          | (Railway domain)            | Your Railway app URL         |

**Generate SESSION_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Set BACKEND_URL:**
After first deployment, Railway will provide a domain like `your-app.railway.app`. Set:

```
BACKEND_URL=https://your-app.railway.app
```

### 4. Configure OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. **Authorized redirect URIs:**
   ```
   https://your-app.railway.app/api/auth/google/callback
   ```
5. Copy Client ID and Secret to Railway variables

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. **Homepage URL:** `https://your-app.railway.app`
4. **Authorization callback URL:**
   ```
   https://your-app.railway.app/api/auth/github/callback
   ```
5. Copy Client ID and Secret to Railway variables

### 5. Deploy

Railway will automatically deploy when you push to the `main` branch (if you set up GitHub integration).

**Manual deployment via CLI:**

```bash
railway up
```

**Monitor deployment:**

- Go to your service in Railway dashboard
- Click **"Deployments"** to see build logs
- Click **"Logs"** to see runtime logs

## Configuration Summary

### Required Files (Already Configured)

✅ **railway.toml** - Railway build configuration
✅ **packages/backend/Dockerfile** - Multi-stage Docker build
✅ **packages/backend/src/app.ts** - Static file serving in production

### Railway Service Settings

**Build:**

- Builder: Dockerfile
- Dockerfile Path: `packages/backend/Dockerfile`
- Build Args: `VITE_API_URL=""`
- Root Directory: `/` (repository root)

**Deploy:**

- Start Command: `sh -c 'cd /app/packages/backend && npx prisma migrate deploy && node dist/server.js'`
- Health Check Path: `/health`
- Health Check Timeout: 100s
- Restart Policy: On failure (max 10 retries)

**Networking:**

- Port: 3002 (automatically detected)
- Public Domain: Enabled

## Environment Variables Reference

### Required Variables

```bash
# Application
NODE_ENV=production
SESSION_SECRET=<64-character-hex-string>

# Database (auto-generated by Railway)
DATABASE_URL=postgresql://...

# Server
BACKEND_URL=https://your-app.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# GitHub OAuth
GITHUB_CLIENT_ID=<from-github-settings>
GITHUB_CLIENT_SECRET=<from-github-settings>
```

### Optional Variables

```bash
# Frontend URL (not needed in production - same origin)
# FRONTEND_URL=

# Port (Railway auto-detects, but can override)
# PORT=3002
```

## Deployment Workflow

### Automatic Deployment

1. Push code to `main` branch
2. Railway detects changes via GitHub webhook
3. Railway builds Docker image using `packages/backend/Dockerfile`
4. Image includes:
   - Built shared package (`packages/shared/dist`)
   - Built frontend (`packages/frontend/dist`)
   - Built backend (`packages/backend/dist`)
   - Prisma client and migrations
5. Railway runs health check on `/health` endpoint
6. If healthy, traffic is routed to new deployment
7. Old deployment is terminated

### Build Process

```
1. Build shared package (TypeScript → JavaScript)
2. Build frontend (Vite → optimized bundles with Brotli/Gzip)
3. Build backend (TypeScript → JavaScript)
4. Generate Prisma client
5. Create production image with:
   - Node.js runtime
   - Production dependencies only
   - All built artifacts
6. Run migrations on startup
7. Start Express server (serves API + static files)
```

## Health Checks

Railway monitors the `/health` endpoint:

```javascript
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

- **Path:** `/health`
- **Timeout:** 100 seconds
- **Expected Response:** 200 OK

## Troubleshooting

### Build Fails

**Check build logs in Railway dashboard:**

- Ensure all dependencies are in `package.json`
- Verify Dockerfile paths are correct
- Check for TypeScript compilation errors

### Runtime Errors

**Check runtime logs:**

```bash
railway logs
```

**Common issues:**

- Missing environment variables
- Database connection errors
- OAuth configuration issues

### Database Connection

**Verify DATABASE_URL:**

```bash
railway run node -e "console.log(process.env.DATABASE_URL)"
```

### OAuth Not Working

**Check callback URLs:**

- Google: `https://your-app.railway.app/api/auth/google/callback`
- GitHub: `https://your-app.railway.app/api/auth/github/callback`

**Verify BACKEND_URL:**

- Must match your Railway domain exactly
- Include `https://` protocol

## Custom Domain (Optional)

1. Go to your service → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** for Railway subdomain
3. Or **"Custom Domain"** to use your own domain
4. Update `BACKEND_URL` environment variable
5. Update OAuth callback URLs in Google/GitHub

## Monitoring

### Railway Dashboard

- **Deployments:** Build status and history
- **Logs:** Real-time application logs
- **Metrics:** CPU, Memory, Network usage
- **Settings:** Environment variables, domains

### Health Monitoring

Railway automatically monitors:

- Health check endpoint (`/health`)
- Restart on failure (max 10 retries)
- Deployment rollback on failure

## Cost Optimization

Railway pricing is based on:

- Build minutes
- Runtime hours
- Memory usage
- Data transfer

**Optimization tips:**

1. Use Railway's build cache (configured in `railway.toml`)
2. Optimize Docker image size (already done with multi-stage builds)
3. Use production dependencies only (`npm ci --omit=dev`)
4. Pre-compress assets (Brotli/Gzip already configured)

## Rollback

If a deployment fails:

**Via Dashboard:**

1. Go to **"Deployments"**
2. Find previous successful deployment
3. Click **"Redeploy"**

**Via CLI:**

```bash
railway rollback
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)

## Summary

✅ GitHub Actions no longer builds Docker images
✅ Railway builds images directly from repository
✅ Automatic deployments on push to `main`
✅ Single service (backend + frontend)
✅ Same-origin deployment (no CORS)
✅ Automatic database migrations
✅ Health monitoring and auto-restart
