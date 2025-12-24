# Wishlist Monorepo

A full-stack TypeScript monorepo with React frontend and Express backend.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: Express, Prisma ORM, Passport.js
- **Database**: PostgreSQL with session store
- **Authentication**: OAuth 2.0 (Google, Facebook, GitHub) <!-- Apple temporarily disabled -->
- **AI Integration**: OpenAI GPT-4o Mini for product extraction from URLs
- **Web Scraping**: Cheerio (fast) + Playwright (SPA fallback)
- **Session Management**: Express sessions with PostgreSQL store
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

### 2. Configure Environment

Copy the example environment file and configure your environment variables:

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env` with your configuration:

**Required Configuration:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wishlist_db"

# Server
PORT=3002
NODE_ENV=development

# Session (IMPORTANT: Generate a secure secret!)
SESSION_SECRET="generate-a-secure-random-string-min-32-chars"
FRONTEND_URL="http://localhost:3000"
```

**Generate a secure session secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**OAuth Configuration (Optional - Configure only the providers you want to use):**

See the detailed OAuth setup guide in [Authentication Setup](#authentication-setup) below.

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
- **Backend**: http://localhost:3002
- **API**: http://localhost:3002/api

**Note**: You must configure OAuth providers before you can login. See [Authentication Setup](#authentication-setup).

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

## Authentication Setup

The application uses OAuth 2.0 authentication with session-based authentication. Users can login with Google, Facebook, or GitHub.

<!-- Apple Sign In is currently disabled but can be re-enabled - see setup guide below -->

### Quick Start (Google OAuth)

1. **Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)**

2. **Create a new project or select existing**

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3002/api/auth/google/callback`
   - Copy the Client ID and Client Secret

5. **Update your `.env` file:**

   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:3002/api/auth/google/callback"
   ```

6. **Restart the backend server**

7. **Test the login flow** at http://localhost:3000/login

### Additional OAuth Providers

<details>
<summary><b>Facebook OAuth Setup</b></summary>

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new app or select existing
3. Add "Facebook Login" product
4. Go to Settings → Basic for App ID and App Secret
5. Go to Facebook Login → Settings
6. Add Valid OAuth Redirect URI: `http://localhost:3002/api/auth/facebook/callback`
7. Update `.env`:
   ```env
   FACEBOOK_APP_ID="your-facebook-app-id"
   FACEBOOK_APP_SECRET="your-facebook-app-secret"
   FACEBOOK_CALLBACK_URL="http://localhost:3002/api/auth/facebook/callback"
   ```
   </details>

<details>
<summary><b>GitHub OAuth Setup</b></summary>

1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in application details
4. Set Authorization callback URL: `http://localhost:3002/api/auth/github/callback`
5. Copy Client ID and generate Client Secret
6. Update `.env`:
   ```env
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GITHUB_CALLBACK_URL="http://localhost:3002/api/auth/github/callback"
   ```
   </details>

<details>
<summary><b>Apple Sign In Setup (CURRENTLY DISABLED)</b></summary>

**Note**: Apple authentication is currently disabled in the codebase but can be easily re-enabled by uncommenting code in the following files:

- `packages/frontend/src/pages/LoginPage.tsx` (lines 68-77)
- `packages/backend/src/features/auth/passport.config.ts` (lines 136-180)
- `packages/backend/src/routes/auth.routes.ts` (lines 48-59)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Create an App ID
3. Create a Services ID (this is your CLIENT_ID)
4. Enable "Sign In with Apple" and configure domains and redirect URLs
5. Create a Private Key for Sign In with Apple
6. Download the .p8 file
7. Get your Team ID from [Membership](https://developer.apple.com/account/#!/membership/)
8. Get your Key ID from the key you created
9. Update `.env`:
   ```env
   APPLE_CLIENT_ID="com.yourcompany.wishlist.signin"
   APPLE_TEAM_ID="your-10-char-team-id"
   APPLE_KEY_ID="your-10-char-key-id"
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour...\n-----END PRIVATE KEY-----"
   APPLE_CALLBACK_URL="http://localhost:3002/api/auth/apple/callback"
   ```
   **Note**: Replace newlines in the private key with `\n`
   </details>

### Session Management

- Sessions are stored in PostgreSQL for persistence
- Session cookies are HttpOnly and secure in production
- Sessions expire after 30 days of inactivity
- Logout destroys the session completely

### Security Features

- ✅ HttpOnly cookies (no JavaScript access)
- ✅ Secure cookies in production (HTTPS only)
- ✅ SameSite cookies (CSRF protection)
- ✅ PostgreSQL session store (persistent sessions)
- ✅ OAuth state parameter validation
- ✅ Helmet middleware for security headers
- ✅ User isolation (users only see their own data)

## AI-Powered Link Analysis Setup

The application can automatically extract product details from URLs using AI. This feature allows users to paste a product link and have the title, description, and price automatically extracted.

### Prerequisites

1. **OpenAI API Key** (Required for link analysis feature)
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Navigate to [API Keys page](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-proj-...`)
   - **Note**: Billing must be set up (GPT-4o Mini is very affordable: ~$0.0003 per analysis)

2. **Update `.env` file:**

   ```env
   OPENAI_API_KEY="sk-proj-your-actual-key-here"
   ```

3. **Restart backend server**

   ```bash
   npm run dev:backend
   ```

### Usage

1. Click "Add from Link" button on homepage
2. Paste a product URL (e.g., from Amazon, Etsy, etc.)
3. Click "Analyze Link"
4. System extracts:
   - Product name/title
   - Description (1-2 sentences)
   - Price (if available)
5. Review and edit the extracted details
6. Click "Add to Wishlist" to save

### Features

- **Smart Detection:** AI determines if URL is a product page
- **Multilingual Support:** Supports product pages in ANY language (English, Ukrainian, Russian, Spanish, etc.)
- **Multi-Currency:** Extracts prices in any currency with automatic currency code detection (USD, EUR, UAH, etc.)
- **Hybrid Scraping:** Fast Cheerio parsing with Playwright fallback for JavaScript-heavy sites
- **Manual Override:** Non-product pages can still be added manually
- **Privacy:** Content is sent to OpenAI for analysis (see [OpenAI's privacy policy](https://openai.com/policies/privacy-policy))

### Troubleshooting

**"AI service not configured" error:**

- Ensure `OPENAI_API_KEY` is set in `.env`
- Restart backend server after adding key

**"Failed to fetch URL content" error:**

- URL may be blocked by website
- Check internet connection
- Some sites block automated access

**No price extracted:**

- Not all sites have machine-readable prices
- Manually enter price if needed

### Cost Estimation

**OpenAI GPT-4o Mini Pricing:**

- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

**Typical Cost per Analysis:** ~$0.0003-0.0005 (less than a tenth of a cent)

**For 1,000 analyses:** ~$0.30-0.50

Very affordable for personal/small-team use!

## API Endpoints

**Note**: All wishlist endpoints require authentication. Include session cookie with requests.

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/facebook` - Initiate Facebook OAuth flow
- `GET /api/auth/github` - Initiate GitHub OAuth flow
- `GET /api/auth/apple` - Initiate Apple OAuth flow
- `GET /api/auth/me` - Get current authenticated user (requires auth)
- `POST /api/auth/logout` - Logout and destroy session

### Wishlist Items (All require authentication)

- `GET /api/items` - List current user's wishlist items
- `GET /api/items/:id` - Get specific item (must belong to user)
- `POST /api/items` - Create new item
  ```json
  {
    "title": "Item name",
    "description": "Optional description",
    "url": "https://example.com",
    "priority": "high"
  }
  ```
- `PUT /api/items/:id` - Update item (must belong to user)
- `DELETE /api/items/:id` - Delete item (must belong to user)

### Link Analysis (Requires authentication and OpenAI API key)

- `POST /api/analyze-link` - Analyze product URL with AI
  ```json
  {
    "url": "https://www.example.com/product"
  }
  ```
  **Response:**
  ```json
  {
    "success": true,
    "data": {
      "isProduct": true,
      "title": "Product Name",
      "description": "Short product description",
      "priceAmount": "19.99",
      "priceCurrency": "USD",
      "confidence": 0.9
    }
  }
  ```

### Health Check

- `GET /health` - Server health status (no auth required)

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

### Price and Currency Support

Wishlist items support multi-currency pricing with two separate fields:

- **priceAmount**: Exact price amount stored as Decimal (e.g., 19.99)
- **priceCurrency**: ISO 4217 currency code (e.g., USD, EUR, GBP, JPY, UAH)

**Supported currencies (36 total):**
USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN, BRL, ZAR, NZD, SGD, HKD, SEK, NOK, DKK, PLN, CZK, HUF, RON, TRY, THB, PHP, IDR, MYR, KRW, RUB, AED, SAR, ILS, EGP, VND, UAH

Both fields are optional, enabling:

- Filtering and sorting by price
- Multi-currency support across all languages
- Automatic currency extraction from product links via AI

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

- **Types**:
  - `WishlistItem` - Wishlist item with user relationship
  - `User` - User with OAuth provider info
  - `ApiResponse<T>` - Standardized API response wrapper
- **Utils**: `formatDate`, `generateId`, `isValidUrl`

Both frontend and backend import from `@wishlist/shared` ensuring type safety across the stack.

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
- Backend: `packages/backend/.env` (PORT=3002)

### Authentication Issues

**"OAuth callback error"**

1. Ensure callback URLs in `.env` match provider configuration exactly
2. Check that SESSION_SECRET is set
3. Verify OAuth provider credentials are correct
4. Check backend logs for detailed error messages

**"Session not persisting"**

1. Ensure PostgreSQL is running (sessions are stored there)
2. Check that session table exists in database
3. Verify cookies are enabled in browser
4. Check that FRONTEND_URL matches your actual frontend URL

**"Cannot access wishlist items"**

1. Ensure you're logged in (check `/api/auth/me`)
2. Wishlist items are user-specific - each user only sees their own items
3. Check that userId is set on items (should happen automatically)

## Next Steps

- ✅ Authentication and user management (OAuth with 4 providers)
- ✅ User-specific wishlists with isolation
- ✅ Session management with PostgreSQL
- Add unit tests with Vitest
- Add E2E tests with Playwright
- Set up CI/CD pipeline
- Add Docker configuration for easy deployment
- Add email notifications for shared wishlists
- Add wishlist sharing and collaboration features
- Add image uploads for wishlist items

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

- Express, CORS, Helmet
- Prisma, @prisma/client
- Passport.js with OAuth strategies:
  - passport-google-oauth20
  - passport-facebook
  - passport-github2
  - passport-apple
- express-session with connect-pg-simple (PostgreSQL store)
- Winston (logging)
- InversifyJS (dependency injection)
- tsx (TypeScript executor)

## License

ISC
