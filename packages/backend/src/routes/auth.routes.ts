import { Router, type Request, type Response, type NextFunction } from 'express';
import passport from 'passport';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { AuthController } from '../features/auth/auth.controller.js';
import { requireAuth } from '../features/auth/auth.middleware.js';
import { ProviderConflictError } from '../features/auth/auth.service.js';

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);
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
    passport.authenticate(provider, (err: unknown, user: unknown) => {
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

      req.logIn(user as Express.User, (loginError: Error | null) => {
        if (loginError) {
          return next(loginError);
        }

        res.redirect(FRONTEND_URL);
      });
    })(req, res, next);
  };
}

// Get current user
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));

// Logout
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

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
