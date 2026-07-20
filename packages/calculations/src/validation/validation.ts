import { Decimal } from '../decimal/index.js';

/**
 * Validates that a probability value is mathematically correct.
 * Must be in the range [0, 1].
 * @param probability Probability as a Decimal.
 * @returns boolean
 */
export function isValidProbability(probability: Decimal): boolean {
  return probability.greaterThanOrEqualTo(0) && probability.lessThanOrEqualTo(1);
}

/**
 * Validates that decimal odds are valid.
 * Must be greater than or equal to 1.0.
 * @param odds Decimal odds.
 * @returns boolean
 */
export function isValidDecimalOdds(odds: Decimal): boolean {
  return odds.greaterThanOrEqualTo(1);
}

/**
 * Validates that American odds are valid.
 * Must not be between -99 and 99 (inclusive). Cannot be zero.
 * @param odds American odds.
 * @returns boolean
 */
export function isValidAmericanOdds(odds: Decimal): boolean {
  if (odds.isZero()) {
    return false;
  }
  return odds.greaterThanOrEqualTo(100) || odds.lessThanOrEqualTo(-100);
}

/**
 * Validates that a set of probabilities sums to 1.0 (within a given tolerance).
 * @param probabilities Array of probabilities.
 * @param tolerance Allowed deviance from 1.0. Defaults to 1e-9.
 * @returns boolean
 */
export function isValidProbabilityVector(probabilities: Decimal[], tolerance: Decimal = new Decimal('1e-9')): boolean {
  if (probabilities.length === 0) {
    return false;
  }

  let sum = new Decimal(0);
  for (const p of probabilities) {
    if (!isValidProbability(p)) {
      return false;
    }
    sum = sum.plus(p);
  }

  return sum.minus(1).abs().lessThan(tolerance);
}
