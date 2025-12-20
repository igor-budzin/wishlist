import { z } from 'zod';

export const wishlistItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
});

export type WishlistItemFormData = z.infer<typeof wishlistItemSchema>;
