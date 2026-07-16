import { Decimal } from '../decimal/index.js';

/**
 * Calculates the Expected Value (EV) of a bet.
 * Formula: EV = (trueProbability * decimalOdds - 1) * stake
 * @param trueProbability The fair probability of winning (0 to 1).
 * @param decimalOdds The decimal odds offered by the bookmaker (must be >= 1.0).
 * @param stake The amount wagered (must be >= 0).
 * @returns Expected Value as a Decimal.
 */
export function expectedValue(
  trueProbability: Decimal,
  decimalOdds: Decimal,
  stake: Decimal = new Decimal(1)
): Decimal {
  if (trueProbability.lessThan(0) || trueProbability.greaterThan(1)) {
    throw new Error('Probability must be between 0 and 1 inclusive.');
  }

  if (decimalOdds.lessThan(1)) {
    throw new Error('Decimal odds cannot be less than 1.0.');
  }

  if (stake.lessThan(0)) {
    throw new Error('Stake cannot be negative.');
  }

  // Formula: (trueProbability * decimalOdds - 1) * stake
  return trueProbability.mul(decimalOdds).minus(1).mul(stake);
}
