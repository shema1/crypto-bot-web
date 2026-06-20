import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { BreakoutStrategyTable } from '../../../../../../../components/core';
import type {
  BreakoutStrategyTableSortField,
  BreakoutStrategyTableSortOrder,
} from '../../../../../../../components/core';
import type { BacktestTask } from '../../../../../../../modules/backtest';
import { getBreakoutMinBars } from '../../../../../../../modules/backtest/utils/strategyCandles.utils';
import StrategyCandleRequirementsPopover from '../../../../StrategyCandleRequirements/StrategyCandleRequirementsPopover';
import {
  BREAKOUT_STRATEGY_LIST_DEFAULTS,
  useGetBreakoutStrategiesQuery,
} from '../../../../../../../modules/strategies/breakoutStrategy';
import type {
  BreakoutStrategyItem,
  BreakoutStrategySortField,
  BreakoutStrategySortOrder,
} from '../../../../../../../modules/strategies/breakoutStrategy';

const DEFAULT_PAGE_SIZE = BREAKOUT_STRATEGY_LIST_DEFAULTS.limit;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export interface BreakoutStrategiesListProps {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  disabled?: boolean;
}

const BreakoutStrategiesList: FC<BreakoutStrategiesListProps> = ({
  backtestTask,
  onChangeBacktestTask,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<BreakoutStrategySortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<BreakoutStrategySortOrder>('asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() && { search: search.trim() }),
      ...(sortBy != null && { sortBy, sortOrder }),
    }),
    [page, limit, search, sortBy, sortOrder]
  );

  const { data, isLoading } = useGetBreakoutStrategiesQuery(queryParams);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const selectedIds = useMemo(
    () =>
      new Set(
        backtestTask.selectedBreakoutStrategies
          .filter((strategy): strategy is NonNullable<typeof strategy> => strategy != null)
          .map((strategy) => strategy.id)
      ),
    [backtestTask.selectedBreakoutStrategies]
  );

  const columnTitles = useMemo(
    () => ({
      name: t('strategies.breakout.columns.name'),
      lookback_period: t('strategies.breakout.columns.lookbackPeriod'),
      breakout_buffer: t('strategies.breakout.columns.breakoutBuffer'),
      min_volume_ratio: t('strategies.breakout.columns.minVolumeRatio'),
      leverage: t('strategies.breakout.columns.leverage'),
      actions: t('strategies.breakout.columns.actions'),
    }),
    [t]
  );

  const handleAdd = useCallback(
    (record: BreakoutStrategyItem) => {
      if (selectedIds.has(record.id)) return;
      onChangeBacktestTask({
        ...backtestTask,
        selectedBreakoutStrategies: [...backtestTask.selectedBreakoutStrategies, record],
      });
    },
    [backtestTask, onChangeBacktestTask, selectedIds]
  );

  const handleRemove = useCallback(
    (record: BreakoutStrategyItem) => {
      if (!selectedIds.has(record.id)) return;
      onChangeBacktestTask({
        ...backtestTask,
        selectedBreakoutStrategies: backtestTask.selectedBreakoutStrategies.filter(
          (strategy) => strategy.id !== record.id
        ),
      });
    },
    [backtestTask, onChangeBacktestTask, selectedIds]
  );

  const handlePaginationChange = useCallback(
    (newPage: number, newPageSize: number) => {
      setPage(newPage);
      if (newPageSize !== limit) {
        setLimit(newPageSize);
        setPage(1);
      }
    },
    [limit]
  );

  const tableSortOrder: BreakoutStrategyTableSortOrder | undefined =
    sortBy == null ? undefined : sortOrder === 'asc' ? 'ascend' : 'descend';

  const handleSortChange = useCallback(
    (
      newSortBy: BreakoutStrategyTableSortField | undefined,
      newSortOrder: BreakoutStrategyTableSortOrder | undefined
    ) => {
      if (newSortBy == null || newSortOrder == null) {
        setSortBy(undefined);
        setSortOrder('asc');
      } else {
        setSortBy(newSortBy as BreakoutStrategySortField);
        setSortOrder(newSortOrder === 'ascend' ? 'asc' : 'desc');
      }
      setPage(1);
    },
    []
  );

  const handleClearSort = useCallback(() => {
    setSortBy(undefined);
    setSortOrder('asc');
    setPage(1);
  }, []);

  const renderCandleRequirements = useCallback(
    (record: BreakoutStrategyItem) => (
      <StrategyCandleRequirementsPopover
        minBars={getBreakoutMinBars({ lookback_period: record.lookback_period })}
        strategyName={record.name}
      />
    ),
    [],
  );

  const renderActions = useCallback(
    (record: BreakoutStrategyItem) => {
      const isAdded = selectedIds.has(record.id);
      return (
        <Button
          type="link"
          size="small"
          danger={isAdded}
          icon={isAdded ? <MinusOutlined /> : <PlusOutlined />}
          disabled={disabled}
          onClick={() => (isAdded ? handleRemove(record) : handleAdd(record))}
        >
          {isAdded
            ? t('backtest.config.strategyManager.remove')
            : t('backtest.config.strategyManager.add')}
        </Button>
      );
    },
    [disabled, handleAdd, handleRemove, selectedIds, t]
  );

  return (
    <div className="strategies-selection__list">
      <BreakoutStrategyTable
        dataSource={items}
        loading={isLoading}
        columnTitles={columnTitles}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: handlePaginationChange,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (totalCount) => t('common.paginationTotal', { total: totalCount }),
        }}
        sort={{
          sortBy: sortBy ?? undefined,
          sortOrder: tableSortOrder,
          onChange: handleSortChange,
        }}
        search={{
          value: searchInput,
          onChange: setSearchInput,
          placeholder: t('strategies.breakout.searchPlaceholder'),
        }}
        toolbar={{
          clearSortLabel: t('strategies.breakout.actions.clearSort'),
          onClearSort: handleClearSort,
        }}
        renderActions={renderActions}
        showCandleRequirements
        renderCandleRequirements={renderCandleRequirements}
      />
    </div>
  );
};

export default BreakoutStrategiesList;
