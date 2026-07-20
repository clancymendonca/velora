import { Decimal } from '../decimal/index.js';

interface Prediction {
  forecastProbability: Decimal; // (0 to 1)
  actualOutcome: Decimal; // 1 for win, 0 for loss
}

export interface CalibrationBucketResult {
  bucketStart: Decimal;
  bucketEnd: Decimal;
  predictionCount: number;
  expectedProbability: Decimal;
  observedFrequency: Decimal;
  brierScore: Decimal;
}

/**
 * Calculates the Brier Score for a set of predictions.
 * Formula: Brier = (1 / N) * sum((forecastProbability_i - actualOutcome_i) ^ 2)
 * Brier score is a measure of the accuracy of probabilistic forecasts (0 is perfect, 1 is worst).
 * @param predictions Array of prediction/outcome pairs.
 * @returns Brier score as a Decimal.
 */
export function calculateBrierScore(predictions: Prediction[]): Decimal {
  if (predictions.length === 0) {
    return new Decimal(0);
  }

  let totalSquaredError = new Decimal(0);

  for (const pred of predictions) {
    if (pred.forecastProbability.lessThan(0) || pred.forecastProbability.greaterThan(1)) {
      throw new Error('Forecast probability must be between 0 and 1 inclusive.');
    }
    if (!pred.actualOutcome.equals(0) && !pred.actualOutcome.equals(1)) {
      throw new Error('Actual outcome must be exactly 0 (loss) or 1 (win).');
    }

    const error = pred.forecastProbability.minus(pred.actualOutcome);
    totalSquaredError = totalSquaredError.plus(error.pow(2));
  }

  return totalSquaredError.div(predictions.length);
}

/**
 * Groups predictions into calibration buckets to build a reliability calibration curve.
 * @param predictions Array of predictions.
 * @param numBuckets Number of calibration intervals (e.g. 10 for 10% steps). Defaults to 10.
 * @returns Array of calibration bucket results.
 */
export function calculateCalibrationBuckets(
  predictions: Prediction[],
  numBuckets = 10
): CalibrationBucketResult[] {
  if (numBuckets <= 0) {
    throw new Error('Number of buckets must be greater than zero.');
  }

  const buckets: CalibrationBucketResult[] = [];
  const step = new Decimal(1).div(numBuckets);

  for (let i = 0; i < numBuckets; i++) {
    const bucketStart = step.mul(i);
    const bucketEnd = step.mul(i + 1);
    
    // Find all predictions falling within this bucket (inclusive of start, exclusive of end except for the last bucket)
    const bucketPredictions = predictions.filter((p) => {
      const prob = p.forecastProbability;
      if (i === numBuckets - 1) {
        return prob.greaterThanOrEqualTo(bucketStart) && prob.lessThanOrEqualTo(bucketEnd);
      }
      return prob.greaterThanOrEqualTo(bucketStart) && prob.lessThan(bucketEnd);
    });

    const count = bucketPredictions.length;
    let expectedSum = new Decimal(0);
    let observedSum = new Decimal(0);
    let squaredErrorSum = new Decimal(0);

    for (const p of bucketPredictions) {
      expectedSum = expectedSum.plus(p.forecastProbability);
      observedSum = observedSum.plus(p.actualOutcome);
      
      const err = p.forecastProbability.minus(p.actualOutcome);
      squaredErrorSum = squaredErrorSum.plus(err.pow(2));
    }

    const expectedProbability = count > 0 ? expectedSum.div(count) : new Decimal(0);
    const observedFrequency = count > 0 ? observedSum.div(count) : new Decimal(0);
    const brierScore = count > 0 ? squaredErrorSum.div(count) : new Decimal(0);

    buckets.push({
      bucketStart,
      bucketEnd,
      predictionCount: count,
      expectedProbability,
      observedFrequency,
      brierScore,
    });
  }

  return buckets;
}
