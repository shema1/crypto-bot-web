import type { BacktestTask, UpdateBacktestTaskRequest } from '../../../../../modules/backtest';

function sortedCopy(values: string[]): string[] {
  return [...values].sort();
}

function areStringArraysEqual(a: string[], b: string[]): boolean {
  const sortedA = sortedCopy(a);
  const sortedB = sortedCopy(b);

  if (sortedA.length !== sortedB.length) return false;
  return sortedA.every((value, index) => value === sortedB[index]);
}

function getStrategyIds(strategies: BacktestTask['selectedTrendFollowingStrategies'] | null | undefined): string[] {
  return (strategies ?? [])
    .filter((strategy): strategy is NonNullable<typeof strategy> => strategy != null)
    .map((strategy) => strategy.id);
}

function areStopLossTakeProfitEqual(
  a: BacktestTask['stopLossTakeProfit'],
  b: BacktestTask['stopLossTakeProfit']
): boolean {
  return (
    a.stopLoss === b.stopLoss &&
    a.takeProfit === b.takeProfit &&
    a.stopLossTakeProfitStep === b.stopLossTakeProfitStep
  );
}

function areDateRangesEqual(a: BacktestTask['dateRange'], b: BacktestTask['dateRange']): boolean {
  return a.startDate === b.startDate && a.endDate === b.endDate;
}

export function isBacktestTaskConfigDirty(saved: BacktestTask, current: BacktestTask): boolean {
  if (!areStringArraysEqual(saved.selectedPairs, current.selectedPairs)) return true;
  if (!areStringArraysEqual(saved.selectedTimeframes, current.selectedTimeframes)) return true;
  if (
    !areStringArraysEqual(
      getStrategyIds(saved.selectedTrendFollowingStrategies),
      getStrategyIds(current.selectedTrendFollowingStrategies)
    )
  ) {
    return true;
  }
  if (
    !areStringArraysEqual(
      getStrategyIds(saved.selectedBreakoutStrategies),
      getStrategyIds(current.selectedBreakoutStrategies)
    )
  ) {
    return true;
  }
  if (!areStopLossTakeProfitEqual(saved.stopLossTakeProfit, current.stopLossTakeProfit)) return true;
  if (!areDateRangesEqual(saved.dateRange, current.dateRange)) return true;

  return false;
}

export function buildBacktestTaskConfigUpdateRequest(task: BacktestTask): UpdateBacktestTaskRequest {
  return {
    selectedPairs: task.selectedPairs ?? [],
    selectedTimeframes: task.selectedTimeframes ?? [],
    selectedTrendFollowingStrategies: getStrategyIds(task.selectedTrendFollowingStrategies),
    selectedBreakoutStrategies: getStrategyIds(task.selectedBreakoutStrategies),
    stopLossTakeProfit: task.stopLossTakeProfit,
    dateRange: task.dateRange,
  };
}
