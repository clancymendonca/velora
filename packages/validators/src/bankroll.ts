import { z } from 'zod';

export const BankrollTransactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'adjustment']),
  amount: z.number().positive('Transaction amount must be positive.'),
  description: z.string().optional(),
});

export type BankrollTransactionInput = z.infer<typeof BankrollTransactionSchema>;
