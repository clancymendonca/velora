import { Decimal } from '../decimal/index.js';

/**
 * Calculates Closing Line Value (CLV) as a percentage.
 * Formula: CLV = (placedOddsDecimal / closingOddsDecimal) - 1
 * Represents how much better the placed odds were compared to the market closing odds.
 * @param placedOddsDecimal Odds the bet was placed at. Must be > 1.0.
 * @param closingOddsDecimal Closing odds of the market. Must be > 1.0.
 * @returns CLV percentage edge as a Decimal.
 */
export function calculateCLV(placedOddsDecimal: Decimal, closingOddsDecimal: Decimal): Decimal {
  if (placedOddsDecimal.lessThanOrEqualTo(1) || closingOddsDecimal.lessThanOrEqualTo(1)) {
    throw new Error('Odds must be greater than 1.0.');
  }

  // Formula: (placedOddsDecimal / closingOddsDecimal) - 1
  return placedOddsDecimal.div(closingOddsDecimal).minus(1);
}
