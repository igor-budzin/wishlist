import { inject, injectable } from 'inversify';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { TYPES } from '../../types.js';
import type { IWishlistItemService } from './wishlist.service.js';

@injectable()
export class WishlistItemController {
  constructor(@inject(TYPES.WishlistItemService) private service: IWishlistItemService) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id; // Safe after requireAuth middleware
      const items = await this.service.getAllItems(userId);
      const response: ApiResponse<typeof items> = {
        success: true,
        data: items,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id; // Safe after requireAuth middleware
      const { id } = req.params;
      const item = await this.service.getItemById(id, userId);
      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
      };
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse<null> = {
          success: false,
          error: req.t('wishlist.itemNotFound', { ns: 'errors' }),
        };
        res.status(404).json(response);
      } else {
        next(error);
      }
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id; // Safe after requireAuth middleware
      // Validation happens in middleware, req.body is validated
      const item = await this.service.createItem(req.body, userId);
      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id; // Safe after requireAuth middleware
      const { id } = req.params;
      const item = await this.service.updateItem(id, userId, req.body);
      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
      };
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse<null> = {
          success: false,
          error: req.t('wishlist.itemNotFound', { ns: 'errors' }),
        };
        res.status(404).json(response);
      } else {
        next(error);
      }
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id; // Safe after requireAuth middleware
      const { id } = req.params;
      await this.service.deleteItem(id, userId);
      const response: ApiResponse<null> = {
        success: true,
        data: null,
      };
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse<null> = {
          success: false,
          error: req.t('wishlist.itemNotFound', { ns: 'errors' }),
        };
        res.status(404).json(response);
      } else {
        next(error);
      }
    }
  }
}
