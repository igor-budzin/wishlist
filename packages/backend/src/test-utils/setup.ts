// Test environment setup
// Ensure test environment variables are set before any tests run

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-secret-min-32-chars-long-xxx';

// Explicitly DO NOT set OPENAI_API_KEY in tests
// This ensures tests use MockAIProvider via conditional DI binding
