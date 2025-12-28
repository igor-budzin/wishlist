import type { Express } from 'express';
import { container } from '../../../container.js';
import { TYPES } from '../../../types.js';
import type { IAuthService } from '../auth.service.js';
import type { IJwtService } from '../jwt.service.js';

/**
 * Add test-only endpoints to the Express app for E2E testing
 * This allows browser tests to bypass OAuth provider interaction
 * while maintaining the same redirect flow
 *
 * Usage in browser E2E tests:
 * ```typescript
 * import app from '../../../app.js';
 * import { addTestEndpoints } from './test-app-setup.js';
 *
 * beforeAll(() => {
 *   addTestEndpoints(app);
 * });
 *
 * // Then in your test:
 * await browser.navigate('http://localhost:3002/api/auth/test-login?email=test@example.com');
 * ```
 */
export function addTestEndpoints(app: Express): void {
  const authService = container.get<IAuthService>(TYPES.AuthService);
  const jwtService = container.get<IJwtService>(TYPES.JwtService);

  // Test-only login endpoint for browser E2E tests
  app.get('/api/auth/test-login', async (req, res, next) => {
    try {
      const { email, provider = 'google' } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Email query parameter is required',
        });
      }

      // Find or create user
      const user = await authService.findOrCreateUser({
        provider: provider as string,
        providerId: `test-${email}`,
        name: 'Test User',
        email: email,
        avatar: undefined,
      });

      // Generate tokens
      const tokens = jwtService.generateTokenPair({
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        createdAt: user.createdAt,
      });

      // Store refresh token
      await authService.storeRefreshToken(user.id, tokens.tokenId, tokens.expiresAt);

      // Redirect like real OAuth
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback#access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  });
}
