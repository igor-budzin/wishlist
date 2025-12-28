import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import routes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import linkAnalysisRoutes from './routes/link-analysis.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { configurePassport } from './features/auth/passport.config.js';
import { container } from './container.js';
import { TYPES } from './types.js';
import type { IAuthService } from './features/auth/auth.service.js';
import type { ILogger } from './lib/logger.js';

const app = express();

// Get dependencies from container
const authService = container.get<IAuthService>(TYPES.AuthService);
const logger = container.get<ILogger>(TYPES.Logger);

// Security middleware
app.use(helmet());

// CORS with credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport initialization
configurePassport(authService, logger);
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', linkAnalysisRoutes);
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoints (only in non-production environments)
if (process.env.NODE_ENV !== 'production') {
  const { addTestEndpoints } = await import('./features/auth/test-helpers/test-app-setup.js');
  addTestEndpoints(app);
}

// Error handling
app.use(errorHandler);

export default app;
