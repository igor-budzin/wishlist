import { inject, injectable } from 'inversify';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { TYPES } from '../../types.js';
import type { ILinkAnalysisService } from './link-analysis.service.js';
import type { AnalyzeLinkDTO } from './link-analysis.schema.js';
import type { ProductData } from './link-analysis.types.js';

@injectable()
export class LinkAnalysisController {
  constructor(@inject(TYPES.LinkAnalysisService) private service: ILinkAnalysisService) {}

  async analyzeLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body as AnalyzeLinkDTO;

      const result = await this.service.analyzeUrl(url);

      const response: ApiResponse<ProductData> = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        // OpenAI API key not configured
        if (error.message.includes('OPENAI_API_KEY')) {
          const response: ApiResponse<null> = {
            success: false,
            error: req.t('linkAnalysis.serviceNotConfigured', { ns: 'errors' }),
          };
          res.status(503).json(response);
          return;
        }

        // URL fetch failures
        if (error.message.includes('Failed to extract') || error.message.includes('HTTP')) {
          const response: ApiResponse<null> = {
            success: false,
            error: req.t('linkAnalysis.fetchFailed', { ns: 'errors' }),
          };
          res.status(400).json(response);
          return;
        }

        // AI analysis failures
        if (error.message.includes('Failed to analyze')) {
          const response: ApiResponse<null> = {
            success: false,
            error: req.t('linkAnalysis.serviceUnavailable', { ns: 'errors' }),
          };
          res.status(503).json(response);
          return;
        }
      }

      // Pass other errors to error handler
      next(error);
    }
  }
}
