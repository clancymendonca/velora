import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('web'),
  hasDatabaseUrl: z.boolean(),
  hasSupabaseUrl: z.boolean(),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
