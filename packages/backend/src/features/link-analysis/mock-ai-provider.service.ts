import { injectable } from 'inversify';
import type { IAIProvider } from './ai-provider.interface.js';
import type { ExtractedContent, AIProviderResponse } from './link-analysis.types.js';

@injectable()
export class MockAIProvider implements IAIProvider {
  async analyzeContent(url: string, _content: ExtractedContent): Promise<AIProviderResponse> {
    // Detect product pages based on URL patterns
    const isProductUrl = this.isProductPage(url);
    const isCategoryUrl = this.isCategoryPage(url);

    if (isCategoryUrl) {
      return {
        isProduct: false,
        title: null,
        description: null,
        priceAmount: null,
        priceCurrency: null,
        reasoning: 'Mock: URL contains category/list page indicators',
      };
    }

    if (isProductUrl) {
      return {
        isProduct: true,
        title: 'Mock Product Title',
        description: 'Mock product description for testing purposes.',
        priceAmount: '99.99',
        priceCurrency: 'USD',
        reasoning: 'Mock: URL contains product page indicators',
      };
    }

    // Default response for ambiguous URLs
    return {
      isProduct: false,
      title: null,
      description: null,
      priceAmount: null,
      priceCurrency: null,
      reasoning: 'Mock: Unable to determine page type from URL',
    };
  }

  private isProductPage(url: string): boolean {
    const productPatterns = [/\/product\//i, /\/item\//i, /\/p\//i, /\/pd\//i, /\/dp\//i];

    return productPatterns.some((pattern) => pattern.test(url));
  }

  private isCategoryPage(url: string): boolean {
    const categoryPatterns = [
      /\/category\//i,
      /\/categories\//i,
      /\/shop\//i,
      /\/products\//i,
      /\/browse\//i,
      /\/search\//i,
      /[?&]category=/i,
      /[?&]cat=/i,
      /[?&]search=/i,
    ];

    return categoryPatterns.some((pattern) => pattern.test(url));
  }
}
