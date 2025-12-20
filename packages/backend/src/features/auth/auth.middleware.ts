import type { Request, Response, NextFunction } from 'express';
import type { UserResponse } from './auth.service.js';
import type { ApiResponse } from '@wishlist/shared';

// Extend Express Request type to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends UserResponse {}
  }
}

/**
 * Middleware that requires authentication.
 * Returns 401 if user is not authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const response: ApiResponse<null> = {
    success: false,
    error: 'Authentication required',
  };
  res.status(401).json(response);
}

/**
 * Middleware that optionally attaches user to request.
 * Continues regardless of authentication status.
 */
export function attachUser(_req: Request, _res: Response, next: NextFunction): void {
  // User is automatically attached by Passport if authenticated
  next();
}
