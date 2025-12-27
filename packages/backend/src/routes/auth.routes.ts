import { Router, type Request, type Response, type NextFunction } from 'express';
import passport from 'passport';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { AuthController } from '../features/auth/auth.controller.js';
import { requireAuth } from '../features/auth/auth.middleware.js';
import {
  ProviderConflictError,
  type UserResponse,
  type IAuthService,
} from '../features/auth/auth.service.js';
import type { IJwtService } from '../features/auth/jwt.service.js';

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);
const jwtService = container.get<IJwtService>(TYPES.JwtService);
const authService = container.get<IAuthService>(TYPES.AuthService);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function getLoginErrorRedirectUrl(): string {
  return `${FRONTEND_URL}/login?error=auth_failed`;
}

function getProviderMismatchRedirectUrl(
  existingProvider: string | undefined,
  attemptedProvider: string
): string {
  const encodedAttempted = encodeURIComponent(attemptedProvider);
  const encodedExisting = existingProvider ? encodeURIComponent(existingProvider) : '';

  if (encodedExisting) {
    return `${FRONTEND_URL}/auth/provider-mismatch?registeredWith=${encodedExisting}&attemptedWith=${encodedAttempted}`;
  }

  return `${FRONTEND_URL}/auth/provider-mismatch?attemptedWith=${encodedAttempted}`;
}

function createOAuthCallbackHandler(provider: 'google' | 'facebook' | 'github') {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(provider, async (err: unknown, user: unknown) => {
      try {
        if (err) {
          if (err instanceof ProviderConflictError) {
            const conflictError = err as ProviderConflictError;
            res.redirect(
              getProviderMismatchRedirectUrl(
                conflictError.existingProvider,
                conflictError.attemptedProvider || provider
              )
            );
            return;
          }

          res.redirect(getLoginErrorRedirectUrl());
          return;
        }

        if (!user) {
          res.redirect(getLoginErrorRedirectUrl());
          return;
        }

        // Generate JWT token pair
        const userResponse = user as UserResponse;
        const { accessToken, refreshToken, tokenId, expiresAt } =
          jwtService.generateTokenPair(userResponse);

        // Store refresh token in database
        await authService.storeRefreshToken(userResponse.id, tokenId, expiresAt);

        // Redirect with tokens in URL fragment
        const redirectUrl = `${FRONTEND_URL}/auth/callback#access_token=${accessToken}&refresh_token=${refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  };
}

// Get current user
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));

// Logout
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Refresh access token
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', createOAuthCallbackHandler('google'));

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', createOAuthCallbackHandler('facebook'));

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', createOAuthCallbackHandler('github'));

/*
// APPLE OAUTH ROUTES DISABLED - Uncomment to re-enable
// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.post(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed` }),
  (_req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);
*/

export default router;
