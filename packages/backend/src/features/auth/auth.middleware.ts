import type { Request, Response, NextFunction } from 'express';
import type { UserResponse } from './auth.service.js';
import type { ApiResponse } from '@wishlist/shared';
import { container } from '../../container.js';
import { TYPES } from '../../types.js';
import type { IJwtService } from './jwt.service.js';
import type { IUserRepository } from '../users/user.repository.js';

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
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  // Fetch user data from database to get complete profile
  const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
  const user = await userRepository.findById(payload.userId);

  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'User not found',
    };
    res.status(401).json(response);
    return;
  }

  // Attach user info to request
  req.user = {
    id: user.id,
    email: user.email,
    provider: payload.provider,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
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
