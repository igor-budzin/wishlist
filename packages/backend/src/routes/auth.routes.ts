import { Router } from 'express';
import passport from 'passport';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { AuthController } from '../features/auth/auth.controller.js';
import { requireAuth } from '../features/auth/auth.middleware.js';

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

// Get current user
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));

// Logout
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed` }),
  (_req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed` }),
  (_req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed` }),
  (_req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

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
