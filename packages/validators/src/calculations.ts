import { z } from 'zod';

export const EVCalculationSchema = z.object({
  stake: z.number().positive('Stake must be positive.'),
  oddsDecimal: z.number().gt(1.0, 'Odds must be greater than 1.0.'),
  winProbability: z.number().min(0.0001, 'Win probability must be > 0.').max(1.0, 'Win probability cannot exceed 1.0.'),
});

export const KellyCalculationSchema = z.object({
  oddsDecimal: z.number().gt(1.0, 'Odds must be greater than 1.0.'),
  estimatedWinProbability: z.number().min(0.0001, 'Probability must be > 0.').max(1.0, 'Probability cannot exceed 1.0.'),
  bankroll: z.number().positive('Bankroll must be positive.'),
  fraction: z.number().min(0.01, 'Fraction must be at least 0.01.').max(1.0, 'Fraction cannot exceed 1.0.').default(0.25),
  maxExposurePercent: z.number().min(0.01).max(100.0).default(5.0),
});

export const DevigCalculationSchema = z.object({
  legOdds: z.array(z.number().gt(1.0, 'Each odds entry must be > 1.0.')).min(2, 'Devigging requires at least 2 selection odds.'),
  method: z.enum(['additive', 'multiplicative', 'shin', 'power']).default('shin'),
});

export type EVCalculationInput = z.infer<typeof EVCalculationSchema>;
export type KellyCalculationInput = z.infer<typeof KellyCalculationSchema>;
export type DevigCalculationInput = z.infer<typeof DevigCalculationSchema>;
