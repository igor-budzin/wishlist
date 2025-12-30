import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import type { ILogger } from '../lib/logger.js';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const logger = container.get<ILogger>(TYPES.Logger);
  logger.error('Unhandled error:', err);

  const response: ApiResponse<null> = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? req.t('internalError', { ns: 'errors' }) : err.message,
  };

  res.status(500).json(response);
};
