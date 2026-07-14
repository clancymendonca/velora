export function impliedProbabilityFromAmerican(odds: number): number {
  if (odds === 0) {
    throw new Error('American odds cannot be zero.');
  }

  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
}

export function americanFromImpliedProbability(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    throw new Error('Probability must be between 0 and 1.');
  }

  return probability >= 0.5
    ? -Math.round((probability / (1 - probability)) * 100)
    : Math.round(((1 - probability) / probability) * 100);
}

export function expectedValue(probability: number, payoutOddsDecimal: number, stake = 1): number {
  if (probability < 0 || probability > 1) {
    throw new Error('Probability must be between 0 and 1.');
  }

  const winProfit = (payoutOddsDecimal - 1) * stake;
  const loseLoss = stake;

  return probability * winProfit - (1 - probability) * loseLoss;
}

export function kellyCriterion(probability: number, payoutOddsDecimal: number): number {
  const b = payoutOddsDecimal - 1;
  const q = 1 - probability;
  const fraction = (b * probability - q) / b;

  return Math.max(0, fraction);
}

export function devig(probabilities: number[]): number[] {
  const total = probabilities.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    throw new Error('Probability total must be positive.');
  }

  return probabilities.map((value) => value / total);
}

export function bankrollUnitSize(bankroll: number, riskPercent: number): number {
  if (bankroll <= 0) {
    throw new Error('Bankroll must be positive.');
  }

  if (riskPercent <= 0 || riskPercent > 100) {
    throw new Error('Risk percent must be between 0 and 100.');
  }

  return bankroll * (riskPercent / 100);
}
