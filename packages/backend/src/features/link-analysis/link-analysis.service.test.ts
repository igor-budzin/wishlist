import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { TYPES } from '../../types.js';
import { LinkAnalysisService } from './link-analysis.service.js';
import { MockAIProvider } from './mock-ai-provider.service.js';
import { Logger } from '../../lib/logger.js';
import type { IAIProvider } from './ai-provider.interface.js';
import type { ILogger } from '../../lib/logger.js';
import type { ExtractedContent } from './link-analysis.types.js';

// Mock ContentExtractor
class MockContentExtractor {
  async extract(_url: string): Promise<ExtractedContent> {
    return {
      html: '<html><body>Test product page</body></html>',
      text: 'Test product page content',
      metadata: {
        title: 'Test Product',
        description: 'Test product description',
        ogTitle: 'Test Product',
        ogDescription: 'Test product description',
        price: '$99.99',
      },
    };
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for mock
  }
}

describe('LinkAnalysisService', () => {
  let container: Container;
  let service: LinkAnalysisService;

  beforeEach(() => {
    // Create a fresh container for each test
    container = new Container();
    container.bind<ILogger>(TYPES.Logger).to(Logger).inSingletonScope();
    container.bind(TYPES.ContentExtractor).to(MockContentExtractor).inSingletonScope();
    container.bind<IAIProvider>(TYPES.AIProvider).to(MockAIProvider).inSingletonScope();
    container
      .bind<LinkAnalysisService>(TYPES.LinkAnalysisService)
      .to(LinkAnalysisService)
      .inSingletonScope();

    service = container.get<LinkAnalysisService>(TYPES.LinkAnalysisService);
  });

  describe('Product Page Detection', () => {
    it('should detect product pages from URL patterns', async () => {
      const result = await service.analyzeUrl('https://example.com/product/12345');

      expect(result.isProduct).toBe(true);
      expect(result.title).toBe('Mock Product Title');
      expect(result.description).toBe('Mock product description for testing purposes.');
      expect(result.priceAmount).toBe('99.99');
      expect(result.priceCurrency).toBe('USD');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should calculate confidence based on extracted fields', async () => {
      const result = await service.analyzeUrl('https://example.com/product/12345');

      // Confidence should be 1.0 (0.4 title + 0.3 description + 0.3 price)
      expect(result.confidence).toBe(1.0);
    });

    it('should handle /item/ URL pattern', async () => {
      const result = await service.analyzeUrl('https://example.com/item/abc-123');

      expect(result.isProduct).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle /p/ URL pattern', async () => {
      const result = await service.analyzeUrl('https://example.com/p/test-product');

      expect(result.isProduct).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Category Page Detection', () => {
    it('should detect category pages from URL patterns', async () => {
      const result = await service.analyzeUrl('https://example.com/category/electronics');

      expect(result.isProduct).toBe(false);
      expect(result.title).toBeNull();
      expect(result.description).toBeNull();
      expect(result.priceAmount).toBeNull();
      expect(result.priceCurrency).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should handle /shop/ URL pattern', async () => {
      const result = await service.analyzeUrl('https://example.com/shop/clothing');

      expect(result.isProduct).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle query parameters for categories', async () => {
      const result = await service.analyzeUrl('https://example.com/products?category=electronics');

      expect(result.isProduct).toBe(false);
      expect(result.confidence).toBe(0);
    });
  });

  describe('Confidence Calculation', () => {
    it('should return 0 confidence for non-product pages', async () => {
      const result = await service.analyzeUrl('https://example.com/category/test');

      expect(result.confidence).toBe(0);
    });

    it('should include reason in the result', async () => {
      const result = await service.analyzeUrl('https://example.com/product/test');

      expect(result.reason).toBeDefined();
      expect(typeof result.reason).toBe('string');
    });
  });

  describe('Ambiguous URLs', () => {
    it('should handle URLs without clear indicators', async () => {
      const result = await service.analyzeUrl('https://example.com/test');

      expect(result.isProduct).toBe(false);
      expect(result.confidence).toBe(0);
    });
  });
});
