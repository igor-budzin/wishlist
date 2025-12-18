import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      try {
        const errorMessages = result.error.errors
          .map(e => {
            const path = e.path.length > 0 ? `${e.path.join('.')}:` : '';
            return `${path} ${e.message}`;
          })
          .join(', ');

        const response: ApiResponse<null> = {
          success: false,
          error: errorMessages,
        };
        return res.status(400).json(response);
      } catch (err) {
        // Fallback error formatting
        const response: ApiResponse<null> = {
          success: false,
          error: 'Validation failed',
        };
        return res.status(400).json(response);
      }
    }

    req.body = result.data;
    next();
  };
};
