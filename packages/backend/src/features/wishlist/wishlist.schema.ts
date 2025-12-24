import { z } from 'zod';
import { Priority } from '@prisma/client';

// ISO 4217 currency codes (common subset)
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

export const currencyCodeSchema = z.enum(CURRENCY_CODES);

export const createWishlistItemSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(1000).optional(),
    url: z.string().url('Invalid URL format').optional().or(z.literal('')),

    priceAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number with up to 2 decimal places')
      .optional()
      .or(z.literal('')),
    priceCurrency: currencyCodeSchema.optional().or(z.literal('')),

    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
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
      message: 'If currency is specified, price amount must also be provided',
      path: ['priceAmount'],
    }
  );

export const updateWishlistItemSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),

    priceAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number with up to 2 decimal places')
      .optional()
      .nullable()
      .or(z.literal('')),
    priceCurrency: currencyCodeSchema.optional().nullable().or(z.literal('')),

    priority: z.enum(['low', 'medium', 'high']).optional(),
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
      message: 'If currency is specified, price amount must also be provided',
      path: ['priceAmount'],
    }
  );

export type CreateWishlistItemDTO = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItemDTO = z.infer<typeof updateWishlistItemSchema>;
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;

// Export currency codes for frontend use
export const SUPPORTED_CURRENCIES = CURRENCY_CODES;

// Helper to convert string priority to Prisma enum
export function toPrismaPriority(priority: string): Priority {
  return priority.toUpperCase() as Priority;
}

// Helper to convert Prisma enum to lowercase string
export function fromPrismaPriority(priority: Priority): 'low' | 'medium' | 'high' {
  return priority.toLowerCase() as 'low' | 'medium' | 'high';
}
