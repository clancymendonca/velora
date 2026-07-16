import { Decimal } from '../decimal/index.js';

/**
 * Calculates a standard bet unit size from bankroll size and risk tolerance.
 * @param bankroll Current bankroll size. Must be > 0.
 * @param riskPercent Percentage of bankroll to risk (e.g. 1.5 for 1.5%).
 * @returns Unit stake as a Decimal.
 */
export function calculateUnitSize(bankroll: Decimal, riskPercent: Decimal): Decimal {
  if (bankroll.lessThanOrEqualTo(0)) {
    throw new Error('Bankroll must be greater than zero.');
  }

  if (riskPercent.lessThanOrEqualTo(0) || riskPercent.greaterThan(100)) {
    throw new Error('Risk percent must be between 0 and 100.');
  }

  return bankroll.mul(riskPercent).div(100);
}

/**
 * Calculates Compound Annual Growth Rate (CAGR).
 * Formula: CAGR = (endingValue / startingValue) ^ (1 / years) - 1
 * @param startingValue Initial bankroll value.
 * @param endingValue Final bankroll value.
 * @param years Time period in years.
 * @returns CAGR as a Decimal.
 */
export function calculateCAGR(startingValue: Decimal, endingValue: Decimal, years: Decimal): Decimal {
  if (startingValue.lessThanOrEqualTo(0) || endingValue.lessThanOrEqualTo(0)) {
    throw new Error('Starting and ending values must be greater than zero.');
  }
  if (years.lessThanOrEqualTo(0)) {
    throw new Error('Years must be greater than zero.');
  }

  const ratio = endingValue.div(startingValue);
  const exponent = new Decimal(1).div(years);
  return ratio.pow(exponent).minus(1);
}

/**
 * Calculates the Maximum Drawdown based on a sequence of historical bankroll balances.
 * @param balances Sequence of bankroll balances.
 * @returns Max Drawdown as a fraction of peak (0 to 1).
 */
export function calculateMaxDrawdown(balances: Decimal[]): Decimal {
  if (balances.length < 2) {
    return new Decimal(0);
  }

  let peak = balances[0];
  let maxDrawdown = new Decimal(0);

  for (const balance of balances) {
    if (balance.greaterThan(peak)) {
      peak = balance;
    }

    const drawdown = peak.minus(balance).div(peak);
    if (drawdown.greaterThan(maxDrawdown)) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}
