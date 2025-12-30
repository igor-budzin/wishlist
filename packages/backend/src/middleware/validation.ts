import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      try {
        // Translate validation error messages
        const errorMessages = result.error.issues
          .map((issue) => {
            // Check if message is a translation key (contains a dot)
            const translatedMessage = issue.message.includes('.')
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (req.t as any)(issue.message.split('.').slice(1).join('.'), { ns: 'validation' })
              : issue.message;
            const path = issue.path.length > 0 ? `${issue.path.join('.')}:` : '';
            return `${path} ${translatedMessage}`;
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
          error: req.t('internalError', { ns: 'errors' }),
        };
        return res.status(400).json(response);
      }
    }

    req.body = result.data;
    next();
  };
};
