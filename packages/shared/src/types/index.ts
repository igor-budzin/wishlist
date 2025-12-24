export interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  /** @deprecated Use priceAmount and priceCurrency instead */
  price?: string;
  priceAmount?: string; // Decimal serialized as string
  priceCurrency?: string; // ISO 4217 currency code (USD, EUR, etc.)
  priority: 'low' | 'medium' | 'high';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar: string | null;
  createdAt: Date;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  stats: {
    totalItems: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
}

export interface ProductData {
  isProduct: boolean;
  title: string | null;
  description: string | null;
  /** @deprecated Use priceAmount and priceCurrency instead */
  price: string | null;
  priceAmount?: string | null; // Numeric price amount
  priceCurrency?: string | null; // ISO 4217 currency code
  confidence: number;
  reason?: string; // Explanation of why it was/wasn't identified as a product
}
