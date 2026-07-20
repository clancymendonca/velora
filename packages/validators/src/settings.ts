import { z } from 'zod';

export const OddsFormatSchema = z.enum(['american', 'decimal', 'fractional']);

export const SportSchema = z.enum(['basketball', 'football', 'soccer', 'baseball', 'tennis', 'esports']);

export const UpdateSettingsSchema = z.object({
  oddsFormat: OddsFormatSchema.default('decimal'),
  defaultStake: z.number().nonnegative('Default stake cannot be negative.'),
  riskTolerancePercent: z.number().positive('Risk tolerance percentage must be positive.').max(100, 'Cannot exceed 100% of bankroll.'),
  kellyFraction: z.number().min(0, 'Kelly multiplier cannot be negative.').max(1.0, 'Kelly multiplier cannot exceed 1.0.'),
  trackedBookmakers: z.array(z.string()).default([]),
  trackedSports: z.array(SportSchema).default([]),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
