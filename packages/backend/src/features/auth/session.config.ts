import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PgSession = connectPgSimple(session);

export function createSessionConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required for session storage');
  }

  // Create a separate connection pool for session store
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return session({
    store: new PgSession({
      pool,
      tableName: 'session', // Table name for sessions
      createTableIfMissing: true, // Auto-create table
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true, // Prevent JavaScript access
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax', // CSRF protection
    },
    name: 'wishlist.sid', // Custom session cookie name
  });
}
