import { Decimal } from '../decimal/index.js';

/**
 * Calculates implied probability from American odds.
 * @param americanOdds American odds as a Decimal. Cannot be zero.
 * @returns Implied probability in range (0, 1) as a Decimal.
 */
export function impliedProbabilityFromAmerican(americanOdds: Decimal): Decimal {
  if (americanOdds.isZero()) {
    throw new Error('American odds cannot be zero.');
  }

  if (americanOdds.isPositive()) {
    return new Decimal(100).div(americanOdds.plus(100));
  } else {
    const absOdds = americanOdds.abs();
    return absOdds.div(absOdds.plus(100));
  }
}

/**
 * Calculates American odds from implied probability.
 * @param probability Implied probability as a Decimal. Must be in (0, 1).
 * @returns American odds rounded to the nearest integer as a Decimal.
 */
export function americanOddsFromImpliedProbability(probability: Decimal): Decimal {
  if (probability.lessThanOrEqualTo(0) || probability.greaterThanOrEqualTo(1)) {
    throw new Error('Probability must be between 0 and 1 exclusive.');
  }

  if (probability.greaterThanOrEqualTo(0.5)) {
    // e.g. 0.5 implied probability = -100
    // formula: -(prob / (1 - prob)) * 100
    const ratio = probability.div(new Decimal(1).minus(probability));
    return ratio.mul(100).negated().toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  } else {
    // e.g. 0.25 implied probability = +300
    // formula: ((1 - prob) / prob) * 100
    const ratio = new Decimal(1).minus(probability).div(probability);
    return ratio.mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  }
}

/**
 * Calculates implied probability from Decimal odds.
 * @param decimalOdds Decimal odds (must be >= 1.0) as a Decimal.
 * @returns Implied probability as a Decimal.
 */
export function impliedProbabilityFromDecimal(decimalOdds: Decimal): Decimal {
  if (decimalOdds.lessThan(1)) {
    throw new Error('Decimal odds cannot be less than 1.0.');
  }
  return new Decimal(1).div(decimalOdds);
}

/**
 * Calculates Decimal odds from implied probability.
 * @param probability Implied probability as a Decimal. Must be in (0, 1).
 * @returns Decimal odds as a Decimal.
 */
export function decimalOddsFromImpliedProbability(probability: Decimal): Decimal {
  if (probability.lessThanOrEqualTo(0) || probability.greaterThanOrEqualTo(1)) {
    throw new Error('Probability must be between 0 and 1 exclusive.');
  }
  return new Decimal(1).div(probability);
}

/**
 * Converts American odds to Decimal odds.
 * @param americanOdds American odds as a Decimal. Cannot be zero.
 * @returns Decimal odds as a Decimal.
 */
export function americanToDecimalOdds(americanOdds: Decimal): Decimal {
  if (americanOdds.isZero()) {
    throw new Error('American odds cannot be zero.');
  }
  
  if (americanOdds.isPositive()) {
    // formula: (americanOdds / 100) + 1
    return americanOdds.div(100).plus(1);
  } else {
    // formula: (100 / |americanOdds|) + 1
    return new Decimal(100).div(americanOdds.abs()).plus(1);
  }
}

/**
 * Converts Decimal odds to American odds.
 * @param decimalOdds Decimal odds as a Decimal. Must be >= 1.0.
 * @returns American odds as a Decimal.
 */
export function decimalToAmericanOdds(decimalOdds: Decimal): Decimal {
  if (decimalOdds.lessThan(1)) {
    throw new Error('Decimal odds cannot be less than 1.0.');
  }
  
  if (decimalOdds.equals(1.0)) {
    throw new Error('Decimal odds of 1.0 cannot be converted to American odds (division by zero).');
  }

  const prob = impliedProbabilityFromDecimal(decimalOdds);
  return americanOddsFromImpliedProbability(prob);
}
