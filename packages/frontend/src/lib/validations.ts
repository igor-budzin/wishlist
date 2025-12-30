import { z } from 'zod';
import i18next from './i18n';

// Custom error map to use i18next for translations
// @ts-expect-error - Zod type definitions are complex, but this works correctly at runtime
z.setErrorMap((issue, ctx) => {
  // If the error message looks like a translation key (contains a dot), translate it
  if (issue.message && issue.message.includes('.')) {
    const params: Record<string, string | number> = {};

    // Extract parameters from context (like max length)
    if ('maximum' in issue && typeof issue.maximum === 'number') {
      params.max = issue.maximum;
    }
    if ('minimum' in issue && typeof issue.minimum === 'number') {
      params.min = issue.minimum;
    }

    return { message: i18next.t(issue.message, params) as string };
  }

  // Otherwise use the default error message
  return { message: ctx.defaultError };
});

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
    title: z.string().min(1, 'validation.title.required').max(100, 'validation.title.maxLength'),
    description: z
      .string()
      .max(500, 'validation.description.maxLength')
      .optional()
      .or(z.literal('')),
    url: z.string().url('validation.url.invalid').optional().or(z.literal('')),

    priceAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'validation.price.invalid')
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
      message: 'validation.price.required',
      path: ['priceAmount'],
    }
  );

export type WishlistItemFormData = z.infer<typeof wishlistItemSchema>;

// Export currency codes for dropdown
export const SUPPORTED_CURRENCIES = CURRENCY_CODES;
