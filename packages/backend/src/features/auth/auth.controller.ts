import { injectable, inject } from 'inversify';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';
import type { IAuthService } from './auth.service.js';
import type { IJwtService } from './jwt.service.js';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.AuthService) private authService: IAuthService,
    @inject(TYPES.JwtService) private jwtService: IJwtService
  ) {}

  /**
   * GET /api/auth/me
   * Returns the current authenticated user
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse<typeof req.user> = {
        success: true,
        data: req.user,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Revoke refresh token and logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Verify and revoke the refresh token
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        if (payload) {
          await this.authService.revokeRefreshToken(payload.tokenId);
          this.logger.info(`User logged out: ${payload.userId}`);
        }
      }

      const response: ApiResponse<null> = {
        success: true,
        data: null,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Refresh token is required',
        };
        res.status(400).json(response);
        return;
      }

      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid or expired refresh token',
        };
        res.status(401).json(response);
        return;
      }

      // Check if token exists in database and is not revoked
      const isValid = await this.authService.isRefreshTokenValid(payload.tokenId);
      if (!isValid) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Refresh token has been revoked',
        };
        res.status(401).json(response);
        return;
      }

      // Get user information
      const user = await this.authService.getUserById(payload.userId);
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }

      // Generate new access token
      const accessToken = this.jwtService.generateAccessToken(
        user.id,
        user.email,
        user.provider
      );

      this.logger.info(`Access token refreshed for user: ${user.id}`);

      const response: ApiResponse<{ accessToken: string }> = {
        success: true,
        data: { accessToken },
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
