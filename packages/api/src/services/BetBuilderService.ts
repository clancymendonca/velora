import { expectedValue, kellyCriterion, Decimal } from '@velora/calculations';

export interface BetLegInput {
  selectionId: string;
  name: string;
  priceDecimal: number;
  estimatedWinProb?: number; // Fair probability
}

export type BetType = 'single' | 'double' | 'treble' | 'parlay' | 'round_robin';

export interface BetBuilderRequest {
  type: BetType;
  legs: BetLegInput[];
  stake: number;
  bankroll: number;
  kellyFraction?: number;
  roundRobinSize?: number; // e.g. 2 for 2-pick combinations (doubles)
}

export interface ParlayCombinationResult {
  legs: BetLegInput[];
  combinedOddsDecimal: number;
  combinedWinProb: number;
  evAmount: number;
  roiPercent: number;
  stake: number;
}

export interface BetBuilderResponse {
  type: BetType;
  totalLegs: number;
  totalCombinations: number;
  totalStake: number;
  combinedOddsDecimal: number;
  combinedWinProb: number;
  expectedValueAmount: number;
  roiPercent: number;
  recommendedKellyStake: number;
  combinations?: ParlayCombinationResult[];
}

export class BetBuilderService {
  /**
   * Constructs and calculates EV, Kelly, and Payouts for Single, Double, Treble, Parlay, and Round Robin bets.
   */
  buildBet(request: BetBuilderRequest): BetBuilderResponse {
    const { type, legs, stake, bankroll, kellyFraction = 0.25 } = request;

    if (legs.length === 0) {
      throw new Error('Bet builder requires at least 1 leg.');
    }

    const stakeDec = new Decimal(stake);
    const bankrollDec = new Decimal(bankroll);
    const fractionDec = new Decimal(kellyFraction);

    if (type === 'single') {
      const leg = legs[0];
      const winProb = leg.estimatedWinProb ?? (1 / leg.priceDecimal);
      const winProbDec = new Decimal(winProb);
      const oddsDec = new Decimal(leg.priceDecimal);

      const evDec = expectedValue(winProbDec, oddsDec, stakeDec);
      const evAmount = evDec.toNumber();
      const roiPercent = (evAmount / stake) * 100;
      const kellyFracDec = kellyCriterion(winProbDec, oddsDec, fractionDec);
      const recommendedKellyStake = bankrollDec.mul(kellyFracDec).toNumber();

      return {
        type: 'single',
        totalLegs: 1,
        totalCombinations: 1,
        totalStake: stake,
        combinedOddsDecimal: leg.priceDecimal,
        combinedWinProb: Number(winProb.toFixed(4)),
        expectedValueAmount: Number(evAmount.toFixed(4)),
        roiPercent: Number(roiPercent.toFixed(2)),
        recommendedKellyStake: Number(recommendedKellyStake.toFixed(2)),
      };
    }

    if (type === 'double' || type === 'treble' || type === 'parlay') {
      const combinedOddsDecimal = legs.reduce((acc, leg) => acc * leg.priceDecimal, 1);
      const combinedWinProb = legs.reduce(
        (acc, leg) => acc * (leg.estimatedWinProb ?? (1 / leg.priceDecimal)),
        1
      );

      const winProbDec = new Decimal(combinedWinProb);
      const oddsDec = new Decimal(combinedOddsDecimal);

      const evDec = expectedValue(winProbDec, oddsDec, stakeDec);
      const evAmount = evDec.toNumber();
      const roiPercent = (evAmount / stake) * 100;
      const kellyFracDec = kellyCriterion(winProbDec, oddsDec, fractionDec);
      const recommendedKellyStake = bankrollDec.mul(kellyFracDec).toNumber();

      return {
        type,
        totalLegs: legs.length,
        totalCombinations: 1,
        totalStake: stake,
        combinedOddsDecimal: Number(combinedOddsDecimal.toFixed(4)),
        combinedWinProb: Number(combinedWinProb.toFixed(4)),
        expectedValueAmount: Number(evAmount.toFixed(4)),
        roiPercent: Number(roiPercent.toFixed(2)),
        recommendedKellyStake: Number(recommendedKellyStake.toFixed(2)),
      };
    }

    if (type === 'round_robin') {
      const comboSize = request.roundRobinSize || 2;
      const combos = this.getCombinations(legs, comboSize);

      const stakePerCombo = stake / combos.length;
      const stakePerComboDec = new Decimal(stakePerCombo);
      let totalEV = 0;

      const combinationResults: ParlayCombinationResult[] = combos.map((comboLegs) => {
        const comboOdds = comboLegs.reduce((acc, leg) => acc * leg.priceDecimal, 1);
        const comboProb = comboLegs.reduce(
          (acc, leg) => acc * (leg.estimatedWinProb ?? (1 / leg.priceDecimal)),
          1
        );
        const comboEVDec = expectedValue(new Decimal(comboProb), new Decimal(comboOdds), stakePerComboDec);
        const comboEV = comboEVDec.toNumber();
        totalEV += comboEV;

        return {
          legs: comboLegs,
          combinedOddsDecimal: Number(comboOdds.toFixed(4)),
          combinedWinProb: Number(comboProb.toFixed(4)),
          evAmount: Number(comboEV.toFixed(4)),
          roiPercent: Number(((comboEV / stakePerCombo) * 100).toFixed(2)),
          stake: Number(stakePerCombo.toFixed(2)),
        };
      });

      const avgOdds = combinationResults.reduce((acc, c) => acc + c.combinedOddsDecimal, 0) / combos.length;
      const avgProb = combinationResults.reduce((acc, c) => acc + c.combinedWinProb, 0) / combos.length;
      const totalROI = (totalEV / stake) * 100;

      return {
        type: 'round_robin',
        totalLegs: legs.length,
        totalCombinations: combos.length,
        totalStake: stake,
        combinedOddsDecimal: Number(avgOdds.toFixed(4)),
        combinedWinProb: Number(avgProb.toFixed(4)),
        expectedValueAmount: Number(totalEV.toFixed(4)),
        roiPercent: Number(totalROI.toFixed(2)),
        recommendedKellyStake: Number((stake * (totalROI > 0 ? 0.25 : 0)).toFixed(2)),
        combinations: combinationResults,
      };
    }

    throw new Error(`Unsupported bet builder type '${type}'.`);
  }

  private getCombinations<T>(arr: T[], size: number): T[][] {
    if (size === 1) return arr.map((item) => [item]);
    const combos: T[][] = [];
    arr.forEach((item, index) => {
      const smallerCombos = this.getCombinations(arr.slice(index + 1), size - 1);
      smallerCombos.forEach((small) => combos.push([item, ...small]));
    });
    return combos;
  }
}
