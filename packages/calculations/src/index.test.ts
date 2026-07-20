import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { Decimal } from './decimal/index.js';
import {
  impliedProbabilityFromAmerican,
  americanOddsFromImpliedProbability,
  impliedProbabilityFromDecimal,
  americanToDecimalOdds,
  devigAdditive,
  devigPower,
  devigShin,
  expectedValue,
  kellyCriterion,
  scaleMultiKelly,
  calculateUnitSize,
  calculateCAGR,
  calculateMaxDrawdown,
  calculateCLV,
  calculateBrierScore,
  calculateCalibrationBuckets,
  simulateBankrollPath,
} from './index.js';

describe('Calculations Core - Odds Conversions', () => {
  it('should correctly convert American odds to implied probability', () => {
    // -110 American odds implies ~0.5238 probability
    const p1 = impliedProbabilityFromAmerican(new Decimal(-110));
    expect(p1.toNumber()).toBeCloseTo(0.5238, 4);

    // +150 American odds implies 0.40 probability
    const p2 = impliedProbabilityFromAmerican(new Decimal(150));
    expect(p2.toNumber()).toBeCloseTo(0.40, 4);
  });

  it('should round-trip American odds and implied probabilities', () => {
    // Property: for any valid American odds, converting to probability and back yields original odds
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: 100, max: 10000 }),
          fc.integer({ min: -10000, max: -100 })
        ),
        (americanOddsVal: number) => {
          const odds = new Decimal(americanOddsVal);
          const prob = impliedProbabilityFromAmerican(odds);
          const roundTrip = americanOddsFromImpliedProbability(prob);
          
          if (Math.abs(americanOddsVal) === 100) {
            expect(Math.abs(roundTrip.toNumber())).toBe(100);
          } else {
            expect(roundTrip.toNumber()).toBe(americanOddsVal);
          }
        }
      )
    );
  });

  it('should correctly convert Decimal odds to implied probability', () => {
    const p = impliedProbabilityFromDecimal(new Decimal('2.0'));
    expect(p.toNumber()).toBe(0.5);

    const p2 = impliedProbabilityFromDecimal(new Decimal('4.0'));
    expect(p2.toNumber()).toBe(0.25);
  });

  it('should convert American to Decimal odds correctly', () => {
    // -110 American is 1.9091 Decimal
    const d1 = americanToDecimalOdds(new Decimal(-110));
    expect(d1.toNumber()).toBeCloseTo(1.9091, 4);

    // +150 American is 2.50 Decimal
    const d2 = americanToDecimalOdds(new Decimal(150));
    expect(d2.toNumber()).toBe(2.5);
  });
});

describe('Calculations Core - Devigging Invariants', () => {
  it('Additive devigging should always yield sum of exactly 1.0', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.1, max: 0.95, noNaN: true, noInfinity: true }), { minLength: 2, maxLength: 5 }),
        (rawProbs: number[]) => {
          const decProbs = rawProbs.map((p) => new Decimal(p));
          const devigged = devigAdditive(decProbs);
          const sum = devigged.reduce((acc, val) => acc.plus(val), new Decimal(0));
          
          expect(sum.toNumber()).toBeCloseTo(1.0, 14);
        }
      )
    );
  });

  it('Power devigging should always yield sum of exactly 1.0 for overround markets', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.1, max: 0.9, noNaN: true, noInfinity: true }), { minLength: 2, maxLength: 4 }),
        (rawProbs: number[]) => {
          // Adjust probabilities to guarantee an overround (sum > 1.0)
          const decProbs = rawProbs.map((p) => new Decimal(p));
          const sumBefore = decProbs.reduce((acc: Decimal, v: Decimal) => acc.plus(v), new Decimal(0));
          
          if (sumBefore.lessThanOrEqualTo(1.0)) {
            // Add a padding selection to force overround
            decProbs.push(new Decimal('0.5'));
          }

          const devigged = devigPower(decProbs);
          const sumAfter = devigged.reduce((acc, val) => acc.plus(val), new Decimal(0));
          
          expect(sumAfter.toNumber()).toBeCloseTo(1.0, 12);
        }
      )
    );
  });

  it('Shin devigging should always yield sum of exactly 1.0 for overround markets', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.1, max: 0.9, noNaN: true, noInfinity: true }), { minLength: 2, maxLength: 4 }),
        (rawProbs: number[]) => {
          const decProbs = rawProbs.map((p) => new Decimal(p));
          const sumBefore = decProbs.reduce((acc: Decimal, v: Decimal) => acc.plus(v), new Decimal(0));
          
          if (sumBefore.lessThanOrEqualTo(1.0)) {
            decProbs.push(new Decimal('0.4'));
          }

          const devigged = devigShin(decProbs);
          const sumAfter = devigged.reduce((acc, val) => acc.plus(val), new Decimal(0));
          
          expect(sumAfter.toNumber()).toBeCloseTo(1.0, 12);
        }
      )
    );
  });
});

describe('Calculations Core - Expected Value (EV)', () => {
  it('should calculate EV correctly and show negative EV when probability is below fair limit', () => {
    // 50% chance, 1.90 odds, $100 stake. EV = (0.5 * 1.9 - 1) * 100 = -5.0
    const evVal = expectedValue(new Decimal('0.5'), new Decimal('1.90'), new Decimal(100));
    expect(evVal.toNumber()).toBe(-5.0);

    // 55% chance, 2.0 odds, $100 stake. EV = (0.55 * 2 - 1) * 100 = +10.0
    const evPositive = expectedValue(new Decimal('0.55'), new Decimal('2.0'), new Decimal(100));
    expect(evPositive.toNumber()).toBe(10.0);
  });

  it('should scale linearly with stake size', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 1.01, max: 10, noNaN: true }),
        fc.double({ min: 1, max: 1000, noNaN: true }),
        (prob: number, odds: number, stake: number) => {
          const p = new Decimal(prob);
          const o = new Decimal(odds);
          const s = new Decimal(stake);

          const evUnit = expectedValue(p, o, new Decimal(1));
          const evScaled = expectedValue(p, o, s);

          expect(evScaled.toNumber()).toBeCloseTo(evUnit.mul(s).toNumber(), 10);
        }
      )
    );
  });
});

describe('Calculations Core - Kelly Criterion', () => {
  it('should compute appropriate Kelly sizing based on EV edge', () => {
    // 55% chance, 2.0 odds (b = 1). f* = (1 * 0.55 - 0.45) / 1 = 0.10 (10% of bankroll)
    const kelly = kellyCriterion(new Decimal('0.55'), new Decimal('2.0'));
    expect(kelly.toNumber()).toBe(0.10);

    // Negative EV should suggest 0 stake fraction
    const negEvKelly = kellyCriterion(new Decimal('0.40'), new Decimal('2.0'));
    expect(negEvKelly.toNumber()).toBe(0);
  });

  it('should cap simultaneous multi-Kelly allocations below exposure limit', () => {
    const fractions = [new Decimal('0.4'), new Decimal('0.4'), new Decimal('0.4')]; // sum = 1.2
    const scaled = scaleMultiKelly(fractions, new Decimal('1.0'));
    
    const sum = scaled.reduce((acc, val) => acc.plus(val), new Decimal(0));
    expect(sum.toNumber()).toBeCloseTo(1.0, 14);
    expect(scaled[0].toNumber()).toBeCloseTo(0.3333, 4);
  });
});

describe('Calculations Core - Financial & Growth Metrics', () => {
  it('calculates unit sizing correctly', () => {
    const unit = calculateUnitSize(new Decimal(10000), new Decimal('1.5')); // 1.5% of 10,000
    expect(unit.toNumber()).toBe(150);
  });

  it('calculates CAGR correctly', () => {
    // grow from 1000 to 2000 in 3 years
    const cagr = calculateCAGR(new Decimal(1000), new Decimal(2000), new Decimal(3));
    expect(cagr.toNumber()).toBeCloseTo(0.2599, 4); // ~26% growth rate
  });

  it('calculates Max Drawdown correctly', () => {
    const path = [
      new Decimal(100),
      new Decimal(120), // Peak 1
      new Decimal(90),  // Drawdown = (120-90)/120 = 25%
      new Decimal(110),
      new Decimal(130), // Peak 2
      new Decimal(117), // Drawdown = (130-117)/130 = 10%
    ];
    const maxDd = calculateMaxDrawdown(path);
    expect(maxDd.toNumber()).toBe(0.25);
  });

  it('calculates Closing Line Value (CLV)', () => {
    // Bet placed at 2.00, closed at 1.80. CLV = 2.0/1.8 - 1 = 11.11%
    const clv = calculateCLV(new Decimal('2.00'), new Decimal('1.80'));
    expect(clv.toNumber()).toBeCloseTo(0.1111, 4);
  });
});

describe('Calculations Core - Forecast Calibration', () => {
  it('calculates Brier Score correctly', () => {
    // 2 predictions: p1=0.8 (won), p2=0.3 (lost)
    // Squared errors: (0.8-1)^2 = 0.04, (0.3-0)^2 = 0.09. Avg = 0.065
    const predictions = [
      { forecastProbability: new Decimal('0.8'), actualOutcome: new Decimal(1) },
      { forecastProbability: new Decimal('0.3'), actualOutcome: new Decimal(0) },
    ];
    const brier = calculateBrierScore(predictions);
    expect(brier.toNumber()).toBe(0.065);
  });

  it('groups predictions into correct reliability calibration buckets', () => {
    const predictions = [
      { forecastProbability: new Decimal('0.15'), actualOutcome: new Decimal(0) },
      { forecastProbability: new Decimal('0.18'), actualOutcome: new Decimal(0) },
      { forecastProbability: new Decimal('0.55'), actualOutcome: new Decimal(1) },
    ];
    // Group into 2 buckets: [0, 0.5) and [0.5, 1.0]
    const buckets = calculateCalibrationBuckets(predictions, 2);
    expect(buckets.length).toBe(2);
    expect(buckets[0].predictionCount).toBe(2); // 0.15 and 0.18
    expect(buckets[1].predictionCount).toBe(1); // 0.55
  });
});

describe('Calculations Core - Monte Carlo Simulations', () => {
  it('should run a deterministic simulation when random seed floats are provided', () => {
    const initialBankroll = new Decimal(100);
    const winProb = new Decimal('0.55');
    const odds = new Decimal('2.00'); // b = 1.0, Edge = 10%. Kelly stake fraction = 10%
    const numBets = 3;

    // Force 3 wins (random values < 0.55)
    const randoms = [new Decimal('0.1'), new Decimal('0.2'), new Decimal('0.3')];

    const sim = simulateBankrollPath(initialBankroll, winProb, odds, new Decimal(1), numBets, randoms);

    expect(sim.isBroke).toBe(false);
    expect(sim.balanceHistory.length).toBe(4);
    // Bet 1: stake 10. Win 10. Balance = 110.
    // Bet 2: stake 11. Win 11. Balance = 121.
    // Bet 3: stake 12.1. Win 12.1. Balance = 133.1.
    expect(sim.balanceHistory[3].toNumber()).toBeCloseTo(133.1, 2);
  });
});
