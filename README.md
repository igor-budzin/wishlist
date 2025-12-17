# Wishlist Monorepo

A full-stack TypeScript monorepo with React frontend and Express backend.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: Express, Prisma ORM
- **Database**: PostgreSQL
- **Shared**: TypeScript types and utilities
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm workspaces

## Project Structure

```
wishlist/
├── packages/
│   ├── shared/        # Shared types and utilities
│   ├── frontend/      # React SPA
│   └── backend/       # Express API with Prisma
├── package.json       # Root workspace config
└── ...config files
```

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher) installed and running
3. A PostgreSQL database created (e.g., `wishlist_db`)

## Getting Started

### 1. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 2. Configure Database

Copy the example environment file and update with your database credentials:

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/wishlist_db"
PORT=3001
NODE_ENV=development
```

### 3. Initialize Database

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run db:generate --workspace=@wishlist/backend

# Create and apply migration
npm run db:migrate:dev --workspace=@wishlist/backend
```

This will create the database tables and generate SQL migration files in `packages/backend/prisma/migrations/`.

### 4. Build Shared Package

```bash
npm run build:shared
```

### 5. Start Development Servers

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API**: http://localhost:3001/api

## Available Scripts

### Root Level

- `npm run dev` - Run all dev servers concurrently
- `npm run dev:frontend` - Run only frontend
- `npm run dev:backend` - Run only backend
- `npm run build` - Build all packages
- `npm run build:shared` - Build shared package
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format all code
- `npm run type-check` - Type check all packages

### Backend Scripts

- `npm run db:migrate:dev --workspace=@wishlist/backend` - Create and apply migration
- `npm run db:migrate:deploy --workspace=@wishlist/backend` - Apply migrations (production)
- `npm run db:push --workspace=@wishlist/backend` - Push schema without migration (dev only)
- `npm run db:studio --workspace=@wishlist/backend` - Open Prisma Studio (GUI)
- `npm run db:generate --workspace=@wishlist/backend` - Generate Prisma Client

## API Endpoints

### Wishlist Items

- `GET /api/items` - List all wishlist items
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Create new item
  ```json
  {
    "title": "Item name",
    "description": "Optional description",
    "url": "https://example.com",
    "priority": "high"
  }
  ```
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Health Check

- `GET /health` - Server health status

## Database Management

### Prisma Studio

View and edit your database with a GUI:

```bash
npm run db:studio --workspace=@wishlist/backend
```

Opens at http://localhost:5555

### Migrations

Prisma generates SQL migrations in `packages/backend/prisma/migrations/`. Each migration contains:

- `migration.sql` - The SQL commands to apply
- Timestamp and descriptive name

To create a new migration after schema changes:

```bash
npm run db:migrate:dev --workspace=@wishlist/backend
```

## Development Workflow

1. **Make changes** to your code
2. **Hot reload** automatically updates:
   - Frontend: Vite HMR
   - Backend: tsx watch mode
3. **Type safety** across the entire stack via shared package
4. **Format code**: `npm run format`
5. **Lint code**: `npm run lint:fix`

## Shared Package

The `@wishlist/shared` package provides type-safe communication:

- **Types**: `WishlistItem`, `ApiResponse`, `User`
- **Utils**: `formatDate`, `generateId`, `isValidUrl`

Both frontend and backend import from `@wishlist/shared`.

## Troubleshooting

### "Cannot find module '@wishlist/shared'"

Build the shared package:

```bash
npm run build:shared
```

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `packages/backend/.env`
3. Verify database exists

### Port Already in Use

Change ports in:

- Frontend: `packages/frontend/vite.config.ts` (port: 3000)
- Backend: `packages/backend/.env` (PORT=3001)

## Next Steps

- Add authentication and user management
- Add unit tests with Vitest
- Add E2E tests with Playwright
- Set up CI/CD pipeline
- Add Docker configuration
- Implement user-specific wishlists

## Project Dependencies

### Root

- TypeScript, ESLint, Prettier
- Workspace management tools

### Shared

- TypeScript only (pure types and utilities)

### Frontend

- React, React DOM
- Tailwind CSS, PostCSS, Autoprefixer
- Vite, @vitejs/plugin-react

### Backend

- Express, CORS
- Prisma, @prisma/client
- tsx (TypeScript executor)

## License

ISC
