import type { ExtractedContent, AIProviderResponse } from './link-analysis.types.js';

export interface IAIProvider {
  analyzeContent(url: string, content: ExtractedContent): Promise<AIProviderResponse>;
}
