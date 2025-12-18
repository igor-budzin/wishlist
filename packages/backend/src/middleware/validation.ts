import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      try {
        const errorMessages = result.error.issues
          .map((issue) => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}:` : '';
            return `${path} ${issue.message}`;
          })
          .join(', ');

        const response: ApiResponse<null> = {
          success: false,
          error: errorMessages,
        };
        return res.status(400).json(response);
      } catch (_err) {
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
