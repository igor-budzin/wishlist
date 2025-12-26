# Docker Infrastructure Setup

This document describes how to set up and run the infrastructure services for the Wishlist application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Services

The docker-compose setup includes the following services:

### PostgreSQL

- **Image**: postgres:16-alpine
- **Port**: 5432 (configurable via `POSTGRES_PORT`)
- **Database**: wishlist_db
- **Purpose**: Main application database

### pgAdmin

- **Image**: dpage/pgadmin4:latest
- **Port**: 5050 (configurable via `PGADMIN_PORT`)
- **Purpose**: Web-based PostgreSQL administration tool

## Configuration

### Environment Variables

The infrastructure is configured using environment variables. Copy the `.env.example` file to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

The following variables are available:

```
# PostgreSQL Configuration
POSTGRES_USER=wishlist_user          # Database username
POSTGRES_PASSWORD=wishlist_password  # Database password
POSTGRES_DB=wishlist_db              # Database name
POSTGRES_PORT=5432                   # PostgreSQL port

# pgAdmin Configuration
PGADMIN_EMAIL=admin@wishlist.local   # pgAdmin login email
PGADMIN_PASSWORD=admin               # pgAdmin login password
PGADMIN_PORT=5050                    # pgAdmin web interface port
```

### Backend Configuration

The backend service requires a `DATABASE_URL` environment variable. This has been configured in `packages/backend/.env` to match the Docker Compose PostgreSQL service:

```
DATABASE_URL="postgresql://wishlist_user:wishlist_password@localhost:5432/wishlist_db"
```

## Usage

### Starting the Infrastructure

Start all services in detached mode:

```bash
docker-compose up -d
```

### Stopping the Infrastructure

Stop all services:

```bash
docker-compose down
```

To also remove volumes (this will delete all data):

```bash
docker-compose down -v
```

### Viewing Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for a specific service:

```bash
docker-compose logs -f postgres
docker-compose logs -f pgadmin
```

### Checking Service Status

Check if services are running:

```bash
docker-compose ps
```

## Accessing Services

### PostgreSQL

Connect to PostgreSQL using any PostgreSQL client:

- **Host**: localhost
- **Port**: 5432 (or value of `POSTGRES_PORT`)
- **Database**: wishlist_db (or value of `POSTGRES_DB`)
- **Username**: wishlist_user (or value of `POSTGRES_USER`)
- **Password**: wishlist_password (or value of `POSTGRES_PASSWORD`)

### pgAdmin

Access pgAdmin web interface:

1. Open browser and navigate to: http://localhost:5050
2. Login with:
   - **Email**: admin@wishlist.local (or value of `PGADMIN_EMAIL`)
   - **Password**: admin (or value of `PGADMIN_PASSWORD`)

#### Adding PostgreSQL Server in pgAdmin

1. Click "Add New Server"
2. In the "General" tab:
   - **Name**: Wishlist DB (or any name you prefer)
3. In the "Connection" tab:
   - **Host name/address**: postgres (the service name in docker-compose)
   - **Port**: 5432
   - **Maintenance database**: wishlist_db
   - **Username**: wishlist_user
   - **Password**: wishlist_password
4. Click "Save"

## Database Migrations

After starting the infrastructure, run Prisma migrations from the backend directory:

```bash
cd packages/backend
npm run db:migrate:dev
```

Or from the root directory:

```bash
npm run db:migrate:dev --workspace=@wishlist/backend
```

## Database Seeding

To populate the database with test data for development, use the seed script:

```bash
# From the root directory
npm run db:seed

# Or from the backend directory
cd packages/backend
npm run db:seed
```

The seed script will:

- Clear all existing wishlist items (if any)
- Create 8 sample wishlist items with various priorities and details

**Note**: The seed script clears existing data before inserting new items. If you want to keep existing data, comment out the `deleteMany()` line in `packages/backend/prisma/seed.ts`.

### When to Run Seed

Run the seed script:

- After initial setup to get sample data
- After resetting the database
- When you need fresh test data for development

### Customizing Seed Data

Edit `packages/backend/prisma/seed.ts` to customize the test data according to your needs.

## Data Persistence

Database data is persisted in Docker volumes:

- `postgres_data`: PostgreSQL database files
- `pgadmin_data`: pgAdmin configuration and settings

These volumes persist even when containers are stopped. To completely remove data, use `docker-compose down -v`.

## Troubleshooting

### Port Already in Use

If you get a port conflict error, either:

1. Stop the service using the port
2. Change the port in the `.env` file

### Container Won't Start

Check the logs:

```bash
docker-compose logs [service-name]
```

### Reset Everything

To completely reset the infrastructure:

```bash
docker-compose down -v
docker-compose up -d
cd packages/backend
npm run db:migrate:dev
```

## Development Workflow

1. Start infrastructure: `docker-compose up -d`
2. Run migrations: `npm run db:push --workspace=@wishlist/backend`
3. Seed database with test data: `npm run db:seed`
4. Start development servers: `npm run dev`
5. Access application at http://localhost:3000 (frontend) and http://localhost:3001 (backend)
6. Access pgAdmin at http://localhost:5050 for database management

## Pre-built Docker Images

Pre-built Docker images are automatically published to GitHub Container Registry (ghcr.io) and are ready for deployment.

### Image Tag Strategy

The project uses different tagging strategies for development (PR builds) and production (main branch builds).

#### Production Tags (Main Branch)

When code is merged to the main branch, Docker images are automatically built and tagged with:

| Tag Pattern   | Example                   | Use Case                                | Persistence                |
| ------------- | ------------------------- | --------------------------------------- | -------------------------- |
| `latest`      | `latest`                  | Always points to most recent main build | Overwritten on each deploy |
| `sha-<full>`  | `sha-1234567890abcdef...` | Exact commit version (40 chars)         | Permanent                  |
| `sha-<short>` | `sha-abc1234`             | Human-readable version (7 chars)        | Permanent                  |
| `<timestamp>` | `2025-12-26T14-30-45Z`    | Chronological version                   | Permanent                  |

**Example:**

```bash
# Latest production version
docker pull ghcr.io/igor-budzin/wishlist-frontend:latest
docker pull ghcr.io/igor-budzin/wishlist-backend:latest

# Specific commit (for rollback or audit)
docker pull ghcr.io/igor-budzin/wishlist-frontend:sha-abc1234
docker pull ghcr.io/igor-budzin/wishlist-backend:sha-1234567890abcdef...

# Specific timestamp (for time-based rollback)
docker pull ghcr.io/igor-budzin/wishlist-frontend:2025-12-26T14-30-45Z
```

#### Development Tags (Pull Requests)

When a PR is created or updated, Docker images are tagged with:

| Tag Pattern      | Example           | Use Case                |
| ---------------- | ----------------- | ----------------------- |
| `pr-<number>`    | `pr-123`          | Latest build of PR #123 |
| `pr-<branch>`    | `pr-feature-auth` | Latest build of branch  |
| `pr-<num>-<sha>` | `pr-123-abc1234`  | Specific commit in PR   |

**Example:**

```bash
# Test PR changes before merging
docker pull ghcr.io/igor-budzin/wishlist-frontend:pr-123
docker pull ghcr.io/igor-budzin/wishlist-backend:pr-feature-auth
```

### Image Registry Access

The Docker images are public and can be pulled without authentication. For private repositories or when pushing images, authenticate with:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Running Pre-built Images

#### Frontend

```bash
# Run latest frontend
docker run -d -p 80:80 \
  --name wishlist-frontend \
  ghcr.io/igor-budzin/wishlist-frontend:latest

# Run specific version
docker run -d -p 80:80 \
  --name wishlist-frontend \
  ghcr.io/igor-budzin/wishlist-frontend:sha-abc1234
```

The frontend serves on port 80 and includes:

- Nginx with Brotli compression
- Pre-compressed static assets
- Security headers configured
- Health check at `/health`

#### Backend

```bash
# Run latest backend
docker run -d -p 3002:3002 \
  --name wishlist-backend \
  -e DATABASE_URL="postgresql://user:password@host:5432/wishlist_db" \
  -e SESSION_SECRET="your-secure-session-secret-min-32-chars" \
  -e FRONTEND_URL="http://localhost:3000" \
  -e GOOGLE_CLIENT_ID="your-google-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  -e GOOGLE_CALLBACK_URL="http://localhost:3002/api/auth/google/callback" \
  ghcr.io/igor-budzin/wishlist-backend:latest

# Run specific version
docker run -d -p 3002:3002 \
  --name wishlist-backend \
  -e DATABASE_URL="postgresql://user:password@host:5432/wishlist_db" \
  -e SESSION_SECRET="your-secure-session-secret" \
  -e FRONTEND_URL="http://localhost:3000" \
  ghcr.io/igor-budzin/wishlist-backend:sha-abc1234
```

**Required Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure random string (min 32 characters)
- `FRONTEND_URL` - URL of the frontend application

**Optional Environment Variables:**

- OAuth provider credentials (Google, Facebook, GitHub)
- `OPENAI_API_KEY` - For AI link analysis
- `NODE_ENV` - Defaults to `production`
- `PORT` - Defaults to `3002`

The backend includes:

- Automatic database migration on startup
- Health check at `/health`
- Optimized production build with pruned dependencies

### Rollback Procedures

If you need to rollback to a previous version after a deployment:

#### 1. Find the Previous Version

**Option A: By Commit SHA**

```bash
# View recent commits on main branch
git log --oneline main -n 10

# Example output:
# abc1234 Fix authentication bug
# def5678 Add new feature
# ghi9012 Update dependencies
```

**Option B: By Timestamp**
Check the GitHub Actions deployment history to find the timestamp of a successful deployment.

**Option C: By GitHub Container Registry**
Browse tags at: `https://github.com/igor-budzin/wishlist/pkgs/container/wishlist-backend`

#### 2. Pull the Previous Version

```bash
# Using commit SHA
docker pull ghcr.io/igor-budzin/wishlist-backend:sha-abc1234
docker pull ghcr.io/igor-budzin/wishlist-frontend:sha-abc1234

# Using timestamp
docker pull ghcr.io/igor-budzin/wishlist-backend:2025-12-25T10-15-30Z
docker pull ghcr.io/igor-budzin/wishlist-frontend:2025-12-25T10-15-30Z
```

#### 3. Stop Current Containers

```bash
docker stop wishlist-backend wishlist-frontend
docker rm wishlist-backend wishlist-frontend
```

#### 4. Deploy Previous Version

```bash
# Backend
docker run -d -p 3002:3002 \
  --name wishlist-backend \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  -e FRONTEND_URL="$FRONTEND_URL" \
  ghcr.io/igor-budzin/wishlist-backend:sha-abc1234

# Frontend
docker run -d -p 80:80 \
  --name wishlist-frontend \
  ghcr.io/igor-budzin/wishlist-frontend:sha-abc1234
```

#### 5. Verify Rollback

```bash
# Check backend health
curl http://localhost:3002/health

# Check frontend health
curl http://localhost:80/health

# View logs
docker logs wishlist-backend
docker logs wishlist-frontend
```

### Database Migrations and Rollback

**Important:** Rolling back the application does not automatically rollback database migrations. If the new version included database schema changes, you may need to:

1. **Restore from database backup** (recommended for production)
2. **Manually revert migrations:**
   ```bash
   # Connect to your database
   # Manually undo migration changes or restore backup
   ```

**Best Practice:** Always take a database backup before deploying schema changes.

## Production Considerations

For production deployment:

1. Change all default passwords in the `.env` file
2. Use strong, randomly generated passwords
3. Consider using Docker secrets instead of environment variables
4. Set up proper backup strategies for the PostgreSQL data volume
5. Use environment-specific `.env` files
6. Consider adding additional services (Redis, monitoring, etc.)
7. **Use specific version tags (SHA or timestamp) in production, not `latest`**
   - Ensures reproducible deployments
   - Prevents unexpected updates
   - Makes rollback explicit and auditable
8. **Set up database backup automation** before each deployment
9. **Monitor image tags** and prune old images periodically to save storage
