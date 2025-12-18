import { injectable, inject } from 'inversify';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';

@injectable()
export class AuthController {
  constructor(@inject(TYPES.Logger) private logger: ILogger) {}

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
   * Logout and destroy session
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      req.logout((err) => {
        if (err) {
          this.logger.error('Logout error', err);
          return next(err);
        }

        req.session.destroy((err) => {
          if (err) {
            this.logger.error('Session destroy error', err);
            return next(err);
          }

          if (userId) {
            this.logger.info(`User logged out: ${userId}`);
          }

          const response: ApiResponse<null> = {
            success: true,
            data: null,
          };
          res.json(response);
        });
      });
    } catch (error) {
      next(error);
    }
  }
}
