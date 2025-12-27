import type { Request, Response, NextFunction } from 'express';
import type { UserResponse } from './auth.service.js';
import type { ApiResponse } from '@wishlist/shared';
import { container } from '../../container.js';
import { TYPES } from '../../types.js';
import type { IJwtService } from './jwt.service.js';

// Extend Express Request type to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends UserResponse {}
  }
}

/**
 * Middleware that requires authentication via JWT.
 * Returns 401 if user is not authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Authentication required',
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Get JWT service from container
  const jwtService = container.get<IJwtService>(TYPES.JwtService);

  // Verify JWT token
  const payload = jwtService.verifyAccessToken(token);

  if (!payload) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid or expired token',
    };
    res.status(401).json(response);
    return;
  }

  // Attach user info to request
  // Note: We trust the JWT claims and don't fetch from DB for performance
  req.user = {
    id: payload.userId,
    email: payload.email,
    provider: payload.provider,
    name: '', // Not in token, would need DB fetch
    avatar: null, // Not in token, would need DB fetch
    createdAt: new Date(), // Not in token, would need DB fetch
  };

  next();
}

/**
 * Middleware that optionally attaches user to request.
 * Continues regardless of authentication status.
 */
export function attachUser(_req: Request, _res: Response, next: NextFunction): void {
  // User is automatically attached by Passport if authenticated
  next();
}
