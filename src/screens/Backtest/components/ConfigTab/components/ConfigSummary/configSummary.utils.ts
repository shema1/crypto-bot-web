import type { BacktestStopLossTakeProfit, BacktestTask } from '../../../../../../modules/backtest';

const FLOAT_EPSILON = 1e-9;

/** Counts grid values from `step` up to `max` inclusive (e.g. max 1, step 0.5 → 2). */
export function countStepGridValues(max: number, step: number): number {
  if (max <= 0) return 0;
  if (step <= 0) return 1;

  let count = 0;
  for (let value = step; value <= max + FLOAT_EPSILON; value += step) {
    count += 1;
  }

  return count;
}

export function countStopLossTakeProfitCombinations({
  stopLoss,
  takeProfit,
  stopLossTakeProfitStep,
}: BacktestStopLossTakeProfit): number {
  const stopLossCount = countStepGridValues(stopLoss, stopLossTakeProfitStep);
  const takeProfitCount = countStepGridValues(takeProfit, stopLossTakeProfitStep);
  return stopLossCount * takeProfitCount;
}

/**
 * Each entry in selectedTrendFollowingStrategies / selectedBreakoutStrategies
 * is one concrete config variant (e.g. 10 Trend Following configs → 10).
 */
export function countStrategyConfigVariants(task: BacktestTask): number {
  return task.selectedTrendFollowingStrategies.length + task.selectedBreakoutStrategies.length;
}

export function countBacktestSimulations(task: BacktestTask): number {
  const assetsCount = task.selectedPairs.length;
  const timeframesCount = task.selectedTimeframes.length;
  const strategyConfigCount = countStrategyConfigVariants(task);
  const slTpCombinations = countStopLossTakeProfitCombinations(task.stopLossTakeProfit);

  return assetsCount * timeframesCount * strategyConfigCount * slTpCombinations;
}
