import { Decimal } from '../decimal/index.js';
import { kellyCriterion } from '../kelly/kelly.js';

interface SimulationResult {
  balanceHistory: Decimal[];
  isBroke: boolean;
  brokeAtBetIndex?: number;
}

/**
 * Runs a single bankroll simulation path over a series of bets.
 * This is a pure function. If `randoms` is provided, it uses it for determinism (testing/EVM),
 * otherwise it generates random outcomes using Math.random().
 * @param initialBankroll Initial bankroll size.
 * @param winProbability True win probability (0 to 1).
 * @param decimalOdds The decimal odds offered.
 * @param kellyFraction Kelly fraction multiplier to size stakes. Defaults to 0.25 (Quarter-Kelly).
 * @param numBets Number of bets to simulate.
 * @param randoms Optional array of pre-generated random values in [0, 1) for outcome checks.
 * @returns SimulationResult containing balance path.
 */
export function simulateBankrollPath(
  initialBankroll: Decimal,
  winProbability: Decimal,
  decimalOdds: Decimal,
  kellyFraction: Decimal = new Decimal('0.25'),
  numBets: number,
  randoms?: Decimal[]
): SimulationResult {
  if (initialBankroll.lessThanOrEqualTo(0)) {
    throw new Error('Initial bankroll must be greater than zero.');
  }
  if (numBets <= 0) {
    throw new Error('Number of bets to simulate must be greater than zero.');
  }

  const balanceHistory: Decimal[] = [initialBankroll];
  let currentBalance = initialBankroll;
  let isBroke = false;
  let brokeAtBetIndex: number | undefined;

  // Pre-calculate the Kelly fraction (stake percentage)
  // stake_pct = kellyCriterion(trueProb, odds, fraction)
  const stakeFraction = kellyCriterion(winProbability, decimalOdds, kellyFraction);

  for (let i = 0; i < numBets; i++) {
    if (currentBalance.lessThan('1.0')) { // Bankroll is considered broke if balance falls below $1.0 (or 1 unit)
      isBroke = true;
      brokeAtBetIndex = i;
      break;
    }

    const stakeAmount = currentBalance.mul(stakeFraction);
    
    // Determine outcome
    const rand = randoms && randoms[i] ? randoms[i] : new Decimal(Math.random());
    const isWin = rand.lessThan(winProbability);

    if (isWin) {
      // winProfit = stakeAmount * (odds - 1)
      const profit = stakeAmount.mul(decimalOdds.minus(1));
      currentBalance = currentBalance.plus(profit);
    } else {
      // loss = stakeAmount
      currentBalance = currentBalance.minus(stakeAmount);
    }

    balanceHistory.push(currentBalance);
  }

  return {
    balanceHistory,
    isBroke,
    brokeAtBetIndex,
  };
}
