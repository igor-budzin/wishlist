import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  const response: ApiResponse<null> = {
    success: false,
    error: err.message || 'Internal server error',
  };

  res.status(500).json(response);
};
