import { injectable, inject } from 'inversify';
import * as cheerio from 'cheerio';
import { chromium, type Browser } from 'playwright';
import { TYPES } from '../../types.js';
import type { ILogger } from '../../lib/logger.js';
import type { ExtractedContent } from './link-analysis.types.js';

@injectable()
export class ContentExtractorService {
  private browser: Browser | null = null;

  constructor(@inject(TYPES.Logger) private logger: ILogger) {}

  async extract(url: string): Promise<ExtractedContent> {
    // Try Cheerio first (fast, works for most sites)
    try {
      this.logger.info(`Extracting content from ${url} with Cheerio`);
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const content = this.parseWithCheerio(html);

      // Check if we got meaningful content
      if (this.hasValidContent(content)) {
        this.logger.info(`Cheerio extraction successful for ${url}`);
        return content;
      }

      this.logger.warn(`Cheerio extraction insufficient for ${url}, falling back to Playwright`);
    } catch (error) {
      this.logger.warn(`Cheerio extraction failed for ${url}: ${error}`);
    }

    // Fallback to Playwright (slower, handles SPAs)
    return this.extractWithPlaywright(url);
  }

  private parseWithCheerio(html: string): ExtractedContent {
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content')?.trim(),
      ogTitle: $('meta[property="og:title"]').attr('content')?.trim(),
      ogDescription: $('meta[property="og:description"]').attr('content')?.trim(),
      price: this.extractPrice($),
    };

    // Extract main text (remove scripts, styles, navigation)
    $('script, style, nav, footer, header, iframe, noscript').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return { html, text, metadata };
  }

  private async extractWithPlaywright(url: string): Promise<ExtractedContent> {
    try {
      this.logger.info(`Extracting content from ${url} with Playwright`);

      if (!this.browser) {
        this.browser = await chromium.launch({ headless: true });
      }

      const page = await this.browser.newPage();

      // Set user agent to avoid blocking
      await page.setExtraHTTPHeaders({
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded', // Changed from 'networkidle' - faster and more reliable
          timeout: 15000, // Reduced timeout
        });

        const html = await page.content();
        await page.close();

        const content = this.parseWithCheerio(html);
        this.logger.info(`Playwright extraction successful for ${url}`);
        return content;
      } catch (error) {
        await page.close();
        throw error;
      }
    } catch (error) {
      this.logger.error(`Playwright extraction failed for ${url}: ${error}`);
      throw new Error('Failed to extract content from URL');
    }
  }

  private extractPrice($: ReturnType<typeof cheerio.load>): string | undefined {
    // Try common price selectors
    const priceSelectors = [
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      '[itemprop="price"]',
      '[itemprop="lowPrice"]',
      '.price',
      '.product-price',
      '#price',
      '[data-price]',
    ];

    for (const selector of priceSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const price =
          element.attr('content') || element.attr('data-price') || element.text().trim();
        if (price) {
          return price;
        }
      }
    }

    return undefined;
  }

  private hasValidContent(content: ExtractedContent): boolean {
    // Check if we have meaningful content
    const hasTitle = !!(content.metadata.title && content.metadata.title.length > 0);
    const hasText = content.text.length > 100; // At least 100 characters
    return hasTitle && hasText;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      this.logger.info('Closing Playwright browser');
      await this.browser.close();
      this.browser = null;
    }
  }
}
