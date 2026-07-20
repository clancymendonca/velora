import { Decimal } from 'decimal.js';

// Configure decimal.js defaults for sports betting (default precision is 20, which is plenty, but we can set 20 to be explicit)
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };
