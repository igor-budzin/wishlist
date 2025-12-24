import { z } from 'zod';

// ISO 4217 currency codes (match backend)
const CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'INR',
  'MXN',
  'BRL',
  'ZAR',
  'NZD',
  'SGD',
  'HKD',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'TRY',
  'THB',
  'PHP',
  'IDR',
  'MYR',
  'KRW',
  'RUB',
  'AED',
  'SAR',
  'ILS',
  'EGP',
  'VND',
  'UAH', // Ukrainian Hryvnia
] as const;

export const wishlistItemSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    url: z.string().url('Must be a valid URL').optional().or(z.literal('')),

    // DEPRECATED: Keep for backwards compatibility
    price: z.string().max(50, 'Price must be less than 50 characters').optional().or(z.literal('')),

    // NEW: Separate price fields
    priceAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a number with up to 2 decimal places')
      .optional()
      .or(z.literal('')),
    priceCurrency: z.enum(CURRENCY_CODES).optional().or(z.literal('')),

    priority: z.enum(['low', 'medium', 'high']),
  })
  .refine(
    (data) => {
      // If currency is provided, amount must be provided
      if (data.priceCurrency && !data.priceAmount) {
        return false;
      }
      return true;
    },
    {
      message: 'Price amount is required when currency is specified',
      path: ['priceAmount'],
    }
  );

export type WishlistItemFormData = z.infer<typeof wishlistItemSchema>;

// Export currency codes for dropdown
export const SUPPORTED_CURRENCIES = CURRENCY_CODES;
