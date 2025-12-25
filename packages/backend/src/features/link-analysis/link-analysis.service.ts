import { injectable, inject } from 'inversify';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';
import type { ContentExtractorService } from './content-extractor.service.js';
import type { IAIProvider } from './ai-provider.interface.js';
import type { ProductData } from './link-analysis.types.js';

export interface ILinkAnalysisService {
  analyzeUrl(url: string): Promise<ProductData>;
}

@injectable()
export class LinkAnalysisService implements ILinkAnalysisService {
  constructor(
    @inject(TYPES.ContentExtractor) private extractor: ContentExtractorService,
    @inject(TYPES.AIProvider) private aiProvider: IAIProvider,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async analyzeUrl(url: string): Promise<ProductData> {
    this.logger.info(`Analyzing URL: ${url}`);

    try {
      // Step 1: Extract content from the URL
      const content = await this.extractor.extract(url);

      // Step 2: Analyze with AI
      const aiResult = await this.aiProvider.analyzeContent(url, content);

      // Step 3: Calculate confidence and transform to ProductData
      const confidence = this.calculateConfidence(aiResult);

      return {
        isProduct: aiResult.isProduct,
        title: aiResult.title,
        description: aiResult.description,
        priceAmount: aiResult.priceAmount,
        priceCurrency: aiResult.priceCurrency,
        confidence,
        reason: aiResult.reasoning,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze URL ${url}: ${error}`);
      throw error;
    }
  }

  private calculateConfidence(result: {
    isProduct: boolean;
    title: string | null;
    description: string | null;
    priceAmount?: string | null;
  }): number {
    if (!result.isProduct) {
      return 0;
    }

    // Calculate confidence based on extracted fields
    let confidence = 0;
    if (result.title) confidence += 0.4;
    if (result.description) confidence += 0.3;
    if (result.priceAmount) confidence += 0.3;

    return Math.min(confidence, 1.0);
  }
}
