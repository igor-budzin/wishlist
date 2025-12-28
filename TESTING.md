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

## Smoke Tests Overview

### Backend Smoke Tests (`packages/backend/src/smoke.test.ts`)

Tests the following:

1. **Health Check**
   - Verifies `/health` endpoint returns 200 OK
   - Checks response contains status and timestamp

2. **Database Connection**
   - Verifies Prisma can connect to PostgreSQL
   - Executes a simple query to confirm database is accessible

3. **API Authentication** (JWT-based)
   - GET `/api/items` - Returns 401 (requires authentication)
   - POST `/api/items` - Returns 401 (requires authentication)
   - DELETE `/api/items/:id` - Returns 401 (requires authentication)

4. **Public Endpoints**
   - OAuth routes are accessible (`/api/auth/google`, `/api/auth/facebook`, `/api/auth/github`)

### Frontend Smoke Tests (`packages/frontend/src/components/App.test.tsx`)

Tests the following:

1. **Component Rendering**
   - App title ("My Wishlist") is displayed
   - Loading state is shown initially

2. **Empty State**
   - Shows appropriate message when no items exist
   - Verifies API is called on component mount

3. **Data Display**
   - Renders items correctly when data is loaded
   - Shows all item properties (title, description, priority)

4. **Error Handling**
   - Displays error messages when API fails
   - Handles network errors gracefully

## Test Requirements

### Prerequisites

Before running tests, ensure:

1. **Docker Infrastructure is Running**

   ```bash
   docker-compose up -d
   ```

2. **Database is Set Up**

   ```bash
   cd packages/backend
   npm run db:push
   ```

3. **Dependencies are Installed**
   ```bash
   npm install
   ```

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

**Test Types**:

1. **Unit Tests**: Mock external dependencies (Prisma, services)
   - `jwt.service.test.ts` - JWT token generation and verification (19 tests)
   - `auth.middleware.test.ts` - JWT authentication middleware (9 tests)
   - `auth.controller.test.ts` - Auth controller endpoints (13 tests)
2. **Integration Tests**: Use real database connection
   - `smoke.test.ts` - API endpoints and database connectivity (6 tests)
   - `link-analysis.controller.test.ts` - Link analysis endpoints (2 tests)
   - `auth.e2e.test.ts` - End-to-end authentication flow testing with JWT tokens
3. **Browser E2E Tests**: Use Playwright to test real browser interactions (requires servers running)
   - `auth-browser.e2e.test.ts` - Manual browser verification tests (placeholder)
   - `social-auth-browser.e2e.test.ts` - Complete social OAuth flow in real browser

### Frontend (`packages/frontend/vitest.config.ts`)

- Environment: jsdom (simulates browser)
- Global test APIs enabled
- React Testing Library configured
- Setup file at `src/test/setup.ts`

## Continuous Integration

To run tests in CI/CD pipelines:

```bash
# Ensure infrastructure is available
docker-compose up -d

# Wait for database to be ready
sleep 5

# Run database setup
npm run db:push --workspace=@wishlist/backend

# Run all tests
npm test

# Or run smoke tests only (faster)
npm run test:smoke
```

## End-to-End (E2E) Testing

### Social OAuth Browser E2E Tests

The `social-auth-browser.e2e.test.ts` file contains comprehensive browser-based E2E tests for the social authentication flow using Playwright. These tests verify the complete OAuth flow in a real browser environment.

**Prerequisites**:

- Frontend server running on `http://localhost:3000`
- Backend server running on `http://localhost:3002`
- Test environment (`NODE_ENV=test`) with test login endpoint enabled

**Test Coverage**:

1. **Login Page UI**
   - Displays all OAuth provider buttons (Google, Facebook, GitHub)
   - Redirects authenticated users away from login page

2. **OAuth Login Flow**
   - Completes OAuth login and stores JWT tokens in localStorage
   - Displays authenticated UI after successful login
   - Allows authenticated API requests with stored tokens
   - Handles login errors gracefully

3. **Authenticated State Management**
   - Persists authentication across page refreshes
   - Protects routes and redirects to login when not authenticated
   - Allows navigation between authenticated pages

4. **Logout Flow**
   - Clears tokens and redirects to login after logout
   - Prevents access to protected pages after logout

5. **Token Security**
   - Clears tokens from URL hash after storing them
   - Does not expose tokens in browser history

6. **Multiple Users**
   - Handles different users in different browser contexts

**Running the Tests**:

```bash
# Start the servers first
npm run dev  # in root directory

# In another terminal, run the E2E tests
cd packages/backend && npm run test:e2e:social-auth
```

**Test Implementation Details**:

The tests use a test-only endpoint (`/api/auth/test-login`) that simulates the OAuth callback without requiring actual OAuth provider interaction. This endpoint:

- Creates or finds a test user in the database
- Generates JWT access and refresh tokens
- Redirects to the frontend auth callback page with tokens
- Follows the same flow as real OAuth providers

## Writing New Tests

### Backend Test Example

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('My Feature', () => {
  it('should do something', async () => {
    const response = await request(app).get('/api/my-endpoint');
    expect(response.status).toBe(200);
  });
});
```

### Frontend Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test Coverage

To generate test coverage reports:

```bash
# Backend coverage
cd packages/backend && npx vitest run --coverage

# Frontend coverage
cd packages/frontend && npx vitest run --coverage
```

Coverage reports are generated in the `coverage/` directory of each package.

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
