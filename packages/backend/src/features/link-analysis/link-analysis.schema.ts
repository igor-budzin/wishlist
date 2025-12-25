import { z } from 'zod';

export const analyzeLinkSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

export type AnalyzeLinkDTO = z.infer<typeof analyzeLinkSchema>;
