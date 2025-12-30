# Testing Guide

This document describes the testing setup and how to run tests for the Wishlist application.

## Test Framework

The project uses [Vitest](https://vitest.dev/) as the testing framework for both backend and frontend:

- **Backend**: Vitest with Supertest for API testing
- **Frontend**: Vitest with React Testing Library for component testing

## Running Tests

### Run All Tests

Run all tests across the entire monorepo:

```bash
npm test
```

### Run Smoke Tests Only

Smoke tests verify basic functionality and are quick to run. They check that the application is working at a fundamental level:

```bash
npm run test:smoke
```

This runs smoke tests for both backend and frontend in parallel.

### Run Backend Tests

```bash
# Run all backend tests
cd packages/backend && npm test

# Run backend smoke tests only
cd packages/backend && npm run test:smoke

# Run E2E tests (requires frontend and backend servers running)
cd packages/backend && npm run test:e2e

# Run browser-based E2E tests for authentication (requires servers)
cd packages/backend && npm run test:e2e:browser

# Run browser-based E2E tests for social OAuth flow (requires servers)
cd packages/backend && npm run test:e2e:social-auth

# Run tests in watch mode (re-runs on file changes)
cd packages/backend && npm run test:watch

# Run tests with UI
cd packages/backend && npm run test:ui
```

### Run Frontend Tests

```bash
# Run all frontend tests
cd packages/frontend && npm test

# Run frontend smoke tests only
cd packages/frontend && npm run test:smoke

# Run tests in watch mode (re-runs on file changes)
cd packages/frontend && npm run test:watch

# Run tests with UI
cd packages/frontend && npm run test:ui
```

## Test Requirements

### Running Tests Without Servers

The smoke tests don't require the dev servers to be running:

- Backend tests start their own test instance of the Express app
- Frontend tests mock the fetch API and don't make real network requests

## Test Configuration

### Backend (`packages/backend/vitest.config.ts`)

- Environment: Node.js
- Global test APIs enabled
- 30 second timeout for tests (to accommodate database operations)
- Setup file at `src/test-utils/setup.ts` - loads `.env` file and configures test environment

**Test Environment Setup (`packages/backend/src/test-utils/setup.ts`)**:

- Automatically loads environment variables from `packages/backend/.env`
- Sets `NODE_ENV=test`
- Configures JWT secrets for testing
- Uses the same database as development (ensure Docker is running)
- Integration tests share the development database

## Continuous Integration

### CI/CD Pipeline Overview

The project uses GitHub Actions for continuous integration with the following test jobs:

### Running Tests in CI

The CI pipeline automatically runs on pull requests to the `main` branch. See [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) for the full configuration.

### E2E Tests in CI

The E2E tests run in a complete application stack using docker-compose:

- **Configuration**: `docker-compose.test.yml`
- **Services**: PostgreSQL, Backend, Frontend
- **Browser**: Chromium (via Playwright)
- **Environment**: Test mode with test login endpoint enabled

The workflow:

1. Builds Docker images for frontend and backend
2. Starts all services with docker-compose
3. Waits for health checks to pass
4. Runs browser-based E2E tests
5. Captures logs on failure
6. Tears down the environment

### Running CI Tests Locally

To run the same tests locally as in CI:

```bash
# Run unit and integration tests
docker-compose up -d postgres
npm ci
npm run build:shared
npx prisma generate --schema=packages/backend/prisma/schema.prisma
npx prisma migrate dev --schema=packages/backend/prisma/schema.prisma
npm test

# Run E2E tests with docker-compose
docker compose -f docker-compose.test.yml up -d
# Wait for services to be healthy
docker compose -f docker-compose.test.yml ps
npm run test:e2e:browser --workspace=@wishlist/backend
docker compose -f docker-compose.test.yml down -v

# Run smoke tests only (faster)
npm run test:smoke
```

### docker-compose.test.yml

This configuration is specifically designed for CI/CD environments:

- Uses production-like Docker builds
- Configures test database credentials
- Sets `NODE_ENV=test` to enable test endpoints
- Includes health checks for all services
- Uses bridge networking for service communication

Key differences from development docker-compose:

- Frontend runs on nginx (production setup) instead of Vite dev server
- Backend runs compiled JavaScript instead of tsx watch mode
- All services have health checks for startup coordination
- Uses test-specific environment variables

## Troubleshooting

### Database Connection Errors

If backend tests fail with database connection errors:

1. Ensure Docker containers are running: `docker-compose ps`
2. Check database is accessible: `docker-compose logs postgres`
3. Verify DATABASE_URL in `packages/backend/.env`

### Port Conflicts

If you see "address already in use" errors:

- Stop dev servers before running backend tests
- Or run tests on a different port by modifying test setup

### React Act Warnings

The frontend tests may show warnings about `act()`. These are non-critical for smoke tests but should be addressed in more comprehensive tests by properly wrapping state updates.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/ladjs/supertest)
