import { z } from 'zod';

export const analyzeLinkSchema = z.object({
  url: z.string().url('validation.url.invalid'),
});

export type AnalyzeLinkDTO = z.infer<typeof analyzeLinkSchema>;
