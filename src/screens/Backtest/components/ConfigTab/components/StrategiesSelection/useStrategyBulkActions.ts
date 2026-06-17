import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import type { BacktestTask } from '../../../../../../modules/backtest';
import {
  useGetBreakoutStrategiesQuery,
  useLazyGetBreakoutStrategiesQuery,
} from '../../../../../../modules/strategies/breakoutStrategy';
import {
  useGetTrendFollowingStrategiesQuery,
  useLazyGetTrendFollowingStrategiesQuery,
} from '../../../../../../modules/strategies/trendFollowingStrategy';
import { fetchAllStrategyPages } from './strategiesSelection.utils';

interface UseStrategyBulkActionsParams {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  disabled?: boolean;
}

interface StrategyBulkActionState {
  isAllSelected: boolean;
  isBulkLoading: boolean;
  isBulkDisabled: boolean;
  onBulkAction: (event: MouseEvent<HTMLElement>) => void;
}

export function useTrendFollowingBulkActions({
  backtestTask,
  onChangeBacktestTask,
  disabled = false,
}: UseStrategyBulkActionsParams): StrategyBulkActionState {
  const [fetchStrategies] = useLazyGetTrendFollowingStrategiesQuery();
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const { data: totalData } = useGetTrendFollowingStrategiesQuery({ page: 1, limit: 1 });

  const total = totalData?.total ?? 0;
  const selectedCount = backtestTask.selectedTrendFollowingStrategies.length;
  const isAllSelected = total > 0 && selectedCount >= total;

  const onBulkAction = useCallback(
    async (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      if (disabled || isBulkLoading || total === 0) return;

      if (isAllSelected) {
        onChangeBacktestTask({
          ...backtestTask,
          selectedTrendFollowingStrategies: [],
        });
        return;
      }

      setIsBulkLoading(true);
      try {
        const allItems = await fetchAllStrategyPages((params) =>
          fetchStrategies(params).unwrap()
        );
        onChangeBacktestTask({
          ...backtestTask,
          selectedTrendFollowingStrategies: allItems,
        });
      } catch {
        // Keep current selection when bulk fetch fails.
      } finally {
        setIsBulkLoading(false);
      }
    },
    [
      backtestTask,
      disabled,
      fetchStrategies,
      isAllSelected,
      isBulkLoading,
      onChangeBacktestTask,
      total,
    ]
  );

  return {
    isAllSelected,
    isBulkLoading,
    isBulkDisabled: disabled || total === 0,
    onBulkAction,
  };
}

export function useBreakoutBulkActions({
  backtestTask,
  onChangeBacktestTask,
  disabled = false,
}: UseStrategyBulkActionsParams): StrategyBulkActionState {
  const [fetchStrategies] = useLazyGetBreakoutStrategiesQuery();
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const { data: totalData } = useGetBreakoutStrategiesQuery({ page: 1, limit: 1 });

  const total = totalData?.total ?? 0;
  const selectedCount = backtestTask.selectedBreakoutStrategies.length;
  const isAllSelected = total > 0 && selectedCount >= total;

  const onBulkAction = useCallback(
    async (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      if (disabled || isBulkLoading || total === 0) return;

      if (isAllSelected) {
        onChangeBacktestTask({
          ...backtestTask,
          selectedBreakoutStrategies: [],
        });
        return;
      }

      setIsBulkLoading(true);
      try {
        const allItems = await fetchAllStrategyPages((params) =>
          fetchStrategies(params).unwrap()
        );
        onChangeBacktestTask({
          ...backtestTask,
          selectedBreakoutStrategies: allItems,
        });
      } catch {
        // Keep current selection when bulk fetch fails.
      } finally {
        setIsBulkLoading(false);
      }
    },
    [
      backtestTask,
      disabled,
      fetchStrategies,
      isAllSelected,
      isBulkLoading,
      onChangeBacktestTask,
      total,
    ]
  );

  return {
    isAllSelected,
    isBulkLoading,
    isBulkDisabled: disabled || total === 0,
    onBulkAction,
  };
}
