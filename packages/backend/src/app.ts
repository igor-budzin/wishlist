import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import expressStaticGzip from 'express-static-gzip';
import routes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import linkAnalysisRoutes from './routes/link-analysis.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createSessionConfig } from './features/auth/session.config.js';
import { configurePassport } from './features/auth/passport.config.js';
import { container } from './container.js';
import { TYPES } from './types.js';
import type { IAuthService } from './features/auth/auth.service.js';
import type { ILogger } from './lib/logger.js';
import type { IConfigService } from './config/index.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Get dependencies from container
const authService = container.get<IAuthService>(TYPES.AuthService);
const logger = container.get<ILogger>(TYPES.Logger);
const config = container.get<IConfigService>(TYPES.ConfigService);

// Security middleware
app.use(helmet());

// CORS with credentials (development only - production uses same-origin)
if (config.isDevelopment()) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(createSessionConfig());

// Passport initialization
configurePassport(authService, logger);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', linkAnalysisRoutes);
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend files in production
if (config.isProduction()) {
  // Middleware to set cache headers for static assets
  app.use((req, res, next) => {
    // Cache hashed assets for 1 year
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    next();
  });

  // Serve pre-compressed static files
  app.use(
    expressStaticGzip(path.join(__dirname, '../../frontend/dist'), {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
    })
  );

  // SPA fallback - serve index.html for all non-API, non-health routes
  app.get('*', (req, res, next) => {
    // Skip SPA fallback for API routes and health check
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error handling
app.use(errorHandler);

export default app;
