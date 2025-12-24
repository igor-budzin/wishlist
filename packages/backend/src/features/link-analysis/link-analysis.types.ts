export interface ProductData {
  isProduct: boolean;
  title: string | null;
  description: string | null;
  priceAmount?: string | null;
  priceCurrency?: string | null;
  confidence: number;
  reason?: string; // Explanation of why it was/wasn't identified as a product
}

export interface ExtractedContent {
  html: string;
  text: string;
  metadata: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    price?: string;
  };
}

export interface AIProviderResponse {
  isProduct: boolean;
  title: string | null;
  description: string | null;
  priceAmount?: string | null;
  priceCurrency?: string | null;
  reasoning: string;
}
