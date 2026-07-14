import { describe, expect, it } from 'vitest';

import {
  bankrollUnitSize,
  devig,
  expectedValue,
  impliedProbabilityFromAmerican,
  kellyCriterion,
} from './index';

describe('calculations package', () => {
  it('converts american odds to implied probability', () => {
    expect(impliedProbabilityFromAmerican(-110)).toBeCloseTo(0.5238, 3);
  });

  it('calculates expected value', () => {
    expect(expectedValue(0.55, 1.91, 100)).toBeCloseTo(5.05, 2);
  });

  it('calculates kelly criterion', () => {
    expect(kellyCriterion(0.55, 1.91)).toBeGreaterThan(0);
  });

  it('devigs probabilities', () => {
    expect(devig([0.52, 0.53]).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 6);
  });

  it('calculates bankroll unit size', () => {
    expect(bankrollUnitSize(1000, 2)).toBe(20);
  });
});
