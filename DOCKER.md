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

## Production Considerations

For production deployment:

1. Change all default passwords in the `.env` file
2. Use strong, randomly generated passwords
3. Consider using Docker secrets instead of environment variables
4. Set up proper backup strategies for the PostgreSQL data volume
5. Use environment-specific `.env` files
6. Consider adding additional services (Redis, monitoring, etc.)
