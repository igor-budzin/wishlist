// Test environment setup
// Ensure test environment variables are set before any tests run

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '.env');
config({ path: envPath });

process.env.NODE_ENV = 'test';

// Use existing DATABASE_URL from .env file, or fall back to example credentials
// Integration tests will use the same database as development
// Tests should clean up after themselves to avoid data pollution
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://wishlist_user:wishlist_password@localhost:5432/wishlist_db';
}

// JWT configuration for tests
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
process.env.JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

// Frontend URL for OAuth redirects in tests
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Explicitly DO NOT set OPENAI_API_KEY in tests
// This ensures tests use MockAIProvider via conditional DI binding
