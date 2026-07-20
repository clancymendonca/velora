import { Decimal } from '../decimal/index.js';

/**
 * Normalizes implied probabilities using the standard Additive (proportional) method.
 * Formula: devigged_i = implied_i / sum(implied_j)
 * @param probabilities Array of implied probabilities.
 * @returns Array of devigged probabilities summing to 1.
 */
export function devigAdditive(probabilities: Decimal[]): Decimal[] {
  if (probabilities.length === 0) {
    throw new Error('Probabilities array cannot be empty.');
  }

  const sum = probabilities.reduce((acc, val) => acc.plus(val), new Decimal(0));
  if (sum.lessThanOrEqualTo(0)) {
    throw new Error('Sum of implied probabilities must be greater than zero.');
  }

  return probabilities.map((p) => p.div(sum));
}

/**
 * Normalizes implied probabilities using the Multiplicative method (same as Additive).
 */
export function devigMultiplicative(probabilities: Decimal[]): Decimal[] {
  return devigAdditive(probabilities);
}

/**
 * Solves for the true probabilities using the Power method.
 * Solves for k > 1 such that: sum(implied_i ^ k) = 1.0, where devigged_i = implied_i ^ k.
 * This method accounts for the longshot bias by taking larger cuts from lower probability events.
 * @param probabilities Array of implied probabilities.
 * @returns Array of devigged probabilities summing to 1.
 */
export function devigPower(probabilities: Decimal[]): Decimal[] {
  if (probabilities.length === 0) {
    throw new Error('Probabilities array cannot be empty.');
  }

  // Ensure all probabilities are in (0, 1)
  for (const p of probabilities) {
    if (p.lessThanOrEqualTo(0) || p.greaterThanOrEqualTo(1)) {
      throw new Error('All probabilities must be strictly between 0 and 1 for Power devigging.');
    }
  }

  const sum = probabilities.reduce((acc, val) => acc.plus(val), new Decimal(0));
  if (sum.lessThanOrEqualTo(1)) {
    // If there is no overround (sum <= 1), we don't need to devig, but for consistency we normalize
    return devigAdditive(probabilities);
  }

  // Solve for k using binary search
  // Since sum > 1 and p_i < 1, k must be > 1.
  let low = new Decimal(1);
  let high = new Decimal(100); // Exponent is very unlikely to exceed 100
  let k = new Decimal(2);
  const tolerance = new Decimal('1e-15');

  for (let iter = 0; iter < 100; iter++) {
    k = low.plus(high).div(2);
    let currentSum = new Decimal(0);
    for (const p of probabilities) {
      currentSum = currentSum.plus(p.pow(k));
    }

    if (currentSum.minus(1).abs().lessThan(tolerance)) {
      break;
    }

    // Since p_i < 1, larger k means smaller p_i^k, which decreases currentSum
    if (currentSum.greaterThan(1)) {
      low = k;
    } else {
      high = k;
    }
  }

  return probabilities.map((p) => p.pow(k));
}

/**
 * Solves for the true probabilities using Shin's Method.
 * Assumes a proportion z of insider traders in the market.
 * The model solves for z in [0, 1) such that:
 * true_p_i = (sqrt(z^2 + 4 * (1 - z) * (implied_i^2 / sum(implied_j))) - z) / (2 * (1 - z))
 * and sum(true_p_i) = 1.0.
 * @param probabilities Array of implied probabilities.
 * @returns Array of devigged probabilities summing to 1.
 */
export function devigShin(probabilities: Decimal[]): Decimal[] {
  if (probabilities.length === 0) {
    throw new Error('Probabilities array cannot be empty.');
  }

  for (const p of probabilities) {
    if (p.lessThanOrEqualTo(0) || p.greaterThanOrEqualTo(1)) {
      throw new Error('All probabilities must be strictly between 0 and 1 for Shin devigging.');
    }
  }

  const impliedSum = probabilities.reduce((acc, val) => acc.plus(val), new Decimal(0));
  if (impliedSum.lessThanOrEqualTo(1)) {
    return devigAdditive(probabilities);
  }

  // Solve for z in [0, 1) such that the sum of true probabilities is exactly 1.0
  let low = new Decimal(0);
  let high = new Decimal(1 - 1e-15); // limit z close to 1 to avoid division by zero
  let z: Decimal;
  const tolerance = new Decimal('1e-15');
  let result: Decimal[] = [];

  for (let iter = 0; iter < 100; iter++) {
    z = low.plus(high).div(2);
    const oneMinusZ = new Decimal(1).minus(z);
    const twoOneMinusZ = oneMinusZ.mul(2);
    const zSq = z.pow(2);

    result = [];
    let currentSum = new Decimal(0);

    for (const p of probabilities) {
      // formula: (sqrt(z^2 + 4 * (1 - z) * p^2 / sum) - z) / (2 * (1 - z))
      // Standard formulation: p is implied probability
      const numerator = zSq.plus(new Decimal(4).mul(oneMinusZ).mul(p.pow(2)).div(impliedSum)).sqrt().minus(z);
      const trueP = numerator.div(twoOneMinusZ);
      result.push(trueP);
      currentSum = currentSum.plus(trueP);
    }

    if (currentSum.minus(1).abs().lessThan(tolerance)) {
      break;
    }

    // Larger z increases the proportion of insider traders, decreasing the true probabilities sum
    if (currentSum.greaterThan(1)) {
      low = z;
    } else {
      high = z;
    }
  }

  // Final normalization to ensure exact sum to 1.0 due to final step limits
  const finalSum = result.reduce((acc, val) => acc.plus(val), new Decimal(0));
  return result.map((p) => p.div(finalSum));
}
