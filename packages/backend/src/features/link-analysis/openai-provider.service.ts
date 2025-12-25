import { injectable, inject } from 'inversify';
import OpenAI from 'openai';
import { TYPES } from '../../types.js';
import type { IConfigService } from '../../config/index.js';
import type { ILogger } from '../../lib/logger.js';
import type { IAIProvider } from './ai-provider.interface.js';
import type { ExtractedContent, AIProviderResponse } from './link-analysis.types.js';

const SYSTEM_PROMPT = `You are a multilingual product page analyzer. Your task is to determine if a webpage is a SINGLE product detail page.

IMPORTANT:
- You must analyze BOTH the URL structure AND the page content
- You MUST support ALL languages including English, Ukrainian, Russian, and any other language
- Product pages in ANY language should be correctly identified
- Extract product details regardless of the language used on the page

URL PATTERN ANALYSIS (Check first):
Common category/list page URL patterns to look for:
- Paths: /category/, /categories/, /shop/, /products/, /browse/, /search/
- Category IDs: /c[digits]/ (e.g., /c80004/), /cat[digits]/, /category-[id]/
- Query parameters: ?category=, ?cat=, ?page=, ?p=, ?search=, ?q=
- Plural forms: /notebooks/, /laptops/, /phones/ (vs singular /notebook/12345/)
- Filter/sort params: ?sort=, ?filter=, ?price=, ?brand=

Common product page URL patterns:
- Paths: /product/, /item/, /p/, /pd/, /dp/
- Product identifiers: long unique IDs, product slugs, SKUs
- Singular forms with specific identifier

CONTENT ANALYSIS:
Single product page indicators:
- ONE primary product name/title
- ONE price prominently displayed
- ONE "Add to Cart" / "Buy Now" button
- Detailed product specifications/description
- Product images/gallery focused on ONE item
- Reviews/ratings for ONE specific product

Category/list page indicators (if ANY of these present, it's NOT a product page):
- MULTIPLE product names listed
- MULTIPLE prices in a grid/list layout
- MULTIPLE "Add to Cart" buttons
- Pagination controls ("Page 1 of 50", "Next", "Previous")
- Filter sidebar/panel (price range, brand, features)
- Sort options ("Sort by: Price", "Popularity")
- Text like "Showing X-Y of Z products"
- Product count ("1,234 items found")
- Breadcrumbs ending in category name

DECISION LOGIC:
1. First check URL - if it clearly indicates category/list, mark as NOT a product page
2. Then check content - if you find multiple product indicators, mark as NOT a product page
3. Only mark as product page if BOTH URL and content suggest a single product
4. When uncertain, err on the side of marking as NOT a product page

EXTRACTION GUIDELINES (for product pages only):
- Extract the most concise yet informative description (1-2 sentences, max 3 if needed)
- For price, extract BOTH the numeric amount AND currency code separately:
  - priceAmount: Numeric value only (e.g., "19.99", "1500")
  - priceCurrency: ISO 4217 code if identifiable (e.g., "USD", "EUR", "JPY", "UAH")
  - If currency cannot be determined, leave priceCurrency as null

Respond ONLY with valid JSON in this exact format:
{
  "isProduct": boolean,
  "title": string | null,
  "description": string | null,
  "priceAmount": string | null,
  "priceCurrency": string | null,
  "reasoning": string
}

Price extraction examples (support ANY currency):
- "$19.99" → priceAmount: "19.99", priceCurrency: "USD"
- "€29.99" → priceAmount: "29.99", priceCurrency: "EUR"
- "1,500円" → priceAmount: "1500", priceCurrency: "JPY"
- "₴499" or "499 грн" → priceAmount: "499", priceCurrency: "UAH"
- "£45.50" → priceAmount: "45.50", priceCurrency: "GBP"
- "20" → priceAmount: "20", priceCurrency: null

In "reasoning" field, explain what URL/content patterns you found that led to your decision.`;

@injectable()
export class OpenAIProvider implements IAIProvider {
  private client: OpenAI;

  constructor(
    @inject(TYPES.ConfigService) private config: IConfigService,
    @inject(TYPES.Logger) private logger: ILogger
  ) {
    const apiKey = this.config.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    this.client = new OpenAI({ apiKey });
  }

  async analyzeContent(url: string, content: ExtractedContent): Promise<AIProviderResponse> {
    this.logger.info(`Analyzing content from ${url} with OpenAI`);

    const prompt = this.buildPrompt(url, content);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      });

      const resultText = response.choices[0].message.content;
      if (!resultText) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(resultText) as AIProviderResponse;
      this.logger.info(`OpenAI analysis complete. isProduct: ${result.isProduct}`);

      return result;
    } catch (error) {
      this.logger.error(`OpenAI analysis failed: ${error}`);
      throw new Error('Failed to analyze content with AI');
    }
  }

  private buildPrompt(url: string, content: ExtractedContent): string {
    // Truncate text content to fit within token limits
    const maxTextLength = 5000;
    const truncatedText = content.text.slice(0, maxTextLength);

    return `URL: ${url}

Metadata:
- Title: ${content.metadata.title || 'N/A'}
- Description: ${content.metadata.description || 'N/A'}
- OG Title: ${content.metadata.ogTitle || 'N/A'}
- OG Description: ${content.metadata.ogDescription || 'N/A'}
- Price hint: ${content.metadata.price || 'N/A'}

Page Text Content (preview):
${truncatedText}${content.text.length > maxTextLength ? '...[truncated]' : ''}

Analyze this page and provide your assessment.`;
  }
}
