import {
  expectedValue,
  kellyCriterion,
  devigAdditive,
  devigMultiplicative,
  devigPower,
  devigShin,
  Decimal,
} from '@velora/calculations';
import { EVCalculationInput, KellyCalculationInput, DevigCalculationInput } from '@velora/validators';

export class CalculationService {
  /**
   * Calculates Expected Value (EV) and ROI percentage using @velora/calculations
   */
  calculateEV(input: EVCalculationInput) {
    const winProbDec = new Decimal(input.winProbability);
    const oddsDec = new Decimal(input.oddsDecimal);
    const stakeDec = new Decimal(input.stake);

    const evDec = expectedValue(winProbDec, oddsDec, stakeDec);
    const evAmount = evDec.toNumber();
    const roiPercent = (evAmount / input.stake) * 100;
    const fairOdds = 1 / input.winProbability;

    return {
      stake: input.stake,
      oddsDecimal: input.oddsDecimal,
      winProbability: input.winProbability,
      fairOdds: Number(fairOdds.toFixed(4)),
      expectedValueAmount: Number(evAmount.toFixed(4)),
      roiPercent: Number(roiPercent.toFixed(2)),
      isPositiveEV: evAmount > 0,
    };
  }

  /**
   * Calculates Kelly Criterion sizing using @velora/calculations
   */
  calculateKelly(input: KellyCalculationInput) {
    const winProbDec = new Decimal(input.estimatedWinProbability);
    const oddsDec = new Decimal(input.oddsDecimal);
    const fractionDec = new Decimal(input.fraction);
    const bankrollDec = new Decimal(input.bankroll);

    const kellyFractionDec = kellyCriterion(winProbDec, oddsDec, fractionDec);
    const rawKellyFraction = kellyFractionDec.toNumber();

    // Scale by bankroll and apply max exposure cap
    const maxExposureDec = new Decimal(input.maxExposurePercent).div(100);
    const cappedFraction = Math.min(rawKellyFraction, maxExposureDec.toNumber());
    const recommendedStake = bankrollDec.mul(cappedFraction).toNumber();

    return {
      oddsDecimal: input.oddsDecimal,
      estimatedWinProbability: input.estimatedWinProbability,
      bankroll: input.bankroll,
      kellyFraction: input.fraction,
      recommendedStake: Number(recommendedStake.toFixed(2)),
      rawKellyFraction: Number(rawKellyFraction.toFixed(4)),
      adjustedFraction: Number(cappedFraction.toFixed(4)),
      exposureCapped: rawKellyFraction > maxExposureDec.toNumber(),
    };
  }

  /**
   * Performs market devigging using @velora/calculations (additive, multiplicative, shin, power)
   */
  calculateDevig(input: DevigCalculationInput) {
    const impliedProbs = input.legOdds.map((odds) => new Decimal(1).div(odds));

    let deviggedDecs: Decimal[] = [];
    switch (input.method) {
      case 'additive':
        deviggedDecs = devigAdditive(impliedProbs);
        break;
      case 'multiplicative':
        deviggedDecs = devigMultiplicative(impliedProbs);
        break;
      case 'power':
        deviggedDecs = devigPower(impliedProbs);
        break;
      case 'shin':
      default:
        deviggedDecs = devigShin(impliedProbs);
        break;
    }

    const fairProbabilities = deviggedDecs.map((d) => d.toNumber());
    const fairOdds = fairProbabilities.map((prob) => Number((1 / prob).toFixed(4)));
    const totalImpliedProb = input.legOdds.reduce((sum, odds) => sum + 1 / odds, 0);
    const overroundPercent = Number(((totalImpliedProb - 1) * 100).toFixed(2));

    return {
      inputOdds: input.legOdds,
      method: input.method,
      overroundPercent,
      fairProbabilities: fairProbabilities.map((p) => Number(p.toFixed(4))),
      fairOdds,
    };
  }
}
