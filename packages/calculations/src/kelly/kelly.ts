import { Decimal } from '../decimal/index.js';

/**
 * Calculates the Kelly Criterion stake fraction.
 * Formula: f* = (b * p - q) / b = ( (oddsDecimal - 1) * trueProbability - (1 - trueProbability) ) / (oddsDecimal - 1)
 * @param trueProbability The fair probability of winning (0 to 1).
 * @param decimalOdds The bookmaker decimal odds (must be > 1.0).
 * @param fraction Fractional Kelly multiplier (e.g. 0.5 for half Kelly). Defaults to 1 (full Kelly).
 * @returns Suggested bankroll stake fraction (0 to 1, or 0 if negative EV).
 */
export function kellyCriterion(
  trueProbability: Decimal,
  decimalOdds: Decimal,
  fraction: Decimal = new Decimal(1)
): Decimal {
  if (trueProbability.lessThan(0) || trueProbability.greaterThan(1)) {
    throw new Error('Probability must be between 0 and 1 inclusive.');
  }

  if (decimalOdds.lessThanOrEqualTo(1)) {
    throw new Error('Decimal odds must be greater than 1.0.');
  }

  if (fraction.lessThanOrEqualTo(0)) {
    throw new Error('Kelly fraction multiplier must be greater than 0.');
  }

  const b = decimalOdds.minus(1);
  const q = new Decimal(1).minus(trueProbability);
  
  // f* = (b * p - q) / b
  const numerator = b.mul(trueProbability).minus(q);
  const fullKelly = numerator.div(b);

  // Suggested stake fraction cannot be less than 0 (no EV edge)
  if (fullKelly.lessThanOrEqualTo(0)) {
    return new Decimal(0);
  }

  return fullKelly.mul(fraction);
}

/**
 * Scales multiple simultaneous independent Kelly bet fractions to avoid over-exposure.
 * If the sum of suggested Kelly fractions exceeds a specified limit (e.g., 1.0 for 100% bankroll exposure),
 * all fractions are scaled proportionally down to the limit.
 * @param fractions Array of calculated Kelly fractions.
 * @param maxTotalExposure Maximum allowed total exposure fraction (e.g., 0.25 for 25% of bankroll). Defaults to 1.0.
 * @returns Array of scaled Kelly fractions.
 */
export function scaleMultiKelly(fractions: Decimal[], maxTotalExposure: Decimal = new Decimal(1)): Decimal[] {
  if (fractions.length === 0) {
    return [];
  }

  if (maxTotalExposure.lessThanOrEqualTo(0)) {
    throw new Error('Maximum total exposure must be positive.');
  }

  const sum = fractions.reduce((acc, val) => acc.plus(val), new Decimal(0));
  
  if (sum.lessThanOrEqualTo(maxTotalExposure)) {
    return fractions;
  }

  const scaleFactor = maxTotalExposure.div(sum);
  return fractions.map((f) => f.mul(scaleFactor));
}
