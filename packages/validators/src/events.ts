import { z } from 'zod';
import { SportSchema } from './settings.js';

export const EventStatusSchema = z.enum(['scheduled', 'live', 'finished', 'suspended', 'cancelled']);

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export const QueryEventsSchema = PaginationQuerySchema.extend({
  sport: SportSchema.optional(),
  status: EventStatusSchema.optional(),
});

export type PaginationQueryInput = z.infer<typeof PaginationQuerySchema>;
export type QueryEventsInput = z.infer<typeof QueryEventsSchema>;
