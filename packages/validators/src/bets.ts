import { z } from 'zod';

export const BetStatusSchema = z.enum(['pending', 'won', 'lost', 'push', 'void']);

export const ParlayLegInputSchema = z.object({
  selectionId: z.string().uuid('Selection ID must be a valid UUID.'),
  status: BetStatusSchema.default('pending'),
});

export const CreateBetSchema = z.object({
  stake: z.number().positive('Stake must be greater than zero.'),
  oddsDecimal: z.number().gte(1.0001, 'Decimal odds must be greater than 1.0.'),
  expectedValue: z.number().describe('Calculated expected value (EV) fraction.'),
  kellyApplied: z.number().min(0).max(1, 'Kelly fraction must be between 0 and 1.'),
  isParlay: z.boolean().default(false),
  legs: z.array(ParlayLegInputSchema).min(1, 'A bet must have at least one selection leg.'),
});

export const UpdateBetSchema = z.object({
  status: BetStatusSchema,
  settledAt: z.string().datetime().optional(),
});

export type CreateBetInput = z.infer<typeof CreateBetSchema>;
export type UpdateBetInput = z.infer<typeof UpdateBetSchema>;
export type ParlayLegInput = z.infer<typeof ParlayLegInputSchema>;
