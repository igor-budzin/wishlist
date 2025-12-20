import { inject, injectable } from 'inversify';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { TYPES } from '../../types.js';
import type { IUserService } from './user.service.js';

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private service: IUserService) {}

  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await this.service.getPublicProfile(userId);
      const response: ApiResponse<typeof profile> = {
        success: true,
        data: profile,
      };
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse<null> = {
          success: false,
          error: error.message,
        };
        res.status(404).json(response);
      } else {
        next(error);
      }
    }
  }
}
