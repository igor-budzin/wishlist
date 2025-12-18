import { z } from 'zod';
import { Priority } from '@prisma/client';

export const createWishlistItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

export const updateWishlistItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export type CreateWishlistItemDTO = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItemDTO = z.infer<typeof updateWishlistItemSchema>;

// Helper to convert string priority to Prisma enum
export function toPrismaPriority(priority: string): Priority {
  return priority.toUpperCase() as Priority;
}

// Helper to convert Prisma enum to lowercase string
export function fromPrismaPriority(priority: Priority): 'low' | 'medium' | 'high' {
  return priority.toLowerCase() as 'low' | 'medium' | 'high';
}
