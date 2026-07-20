import { describe, it, expect } from 'vitest';
import { CalculationService } from './CalculationService.js';

describe('CalculationService API Unit Tests', () => {
  const service = new CalculationService();

  it('calculates EV correctly for a +EV bet', () => {
    const result = service.calculateEV({
      stake: 100,
      oddsDecimal: 2.1,
      winProbability: 0.52,
    });

    expect(result.isPositiveEV).toBe(true);
    expect(result.expectedValueAmount).toBeGreaterThan(0);
    expect(result.fairOdds).toBeCloseTo(1.923, 2);
  });

  it('calculates Kelly Criterion recommended stake correctly', () => {
    const result = service.calculateKelly({
      oddsDecimal: 2.0,
      estimatedWinProbability: 0.55,
      bankroll: 1000,
      fraction: 0.25,
      maxExposurePercent: 5.0,
    });

    expect(result.recommendedStake).toBeGreaterThan(0);
    expect(result.exposureCapped).toBe(false);
  });

  it('devigs 2-way market correctly with Shin method', () => {
    const result = service.calculateDevig({
      legOdds: [1.9, 1.9],
      method: 'shin',
    });

    expect(result.fairProbabilities.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 3);
    expect(result.overroundPercent).toBeGreaterThan(0);
  });
});
