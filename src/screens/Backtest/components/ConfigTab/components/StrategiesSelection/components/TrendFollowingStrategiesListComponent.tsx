import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendFollowingTable } from '../../../../../../../components/core';
import type {
  TrendFollowingTableSortField,
  TrendFollowingTableSortOrder,
} from '../../../../../../../components/core';
import type { BacktestTask } from '../../../../../../../modules/backtest';
import {
  TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS,
  useGetTrendFollowingStrategiesQuery,
} from '../../../../../../../modules/strategies/trendFollowingStrategy';
import type {
  TrendFollowingStrategyItem,
  TrendFollowingStrategySortField,
  TrendFollowingStrategySortOrder,
} from '../../../../../../../modules/strategies/trendFollowingStrategy';

const DEFAULT_PAGE_SIZE = TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS.limit;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export interface TrendFollowingStrategiesListProps {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  disabled?: boolean;
}

const TrendFollowingStrategiesList: FC<TrendFollowingStrategiesListProps> = ({
  backtestTask,
  onChangeBacktestTask,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<TrendFollowingStrategySortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<TrendFollowingStrategySortOrder>('asc');

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

  const { data, isLoading } = useGetTrendFollowingStrategiesQuery(queryParams);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const selectedIds = useMemo(
    () =>
      new Set(
        backtestTask.selectedTrendFollowingStrategies
          .filter((strategy): strategy is NonNullable<typeof strategy> => strategy != null)
          .map((strategy) => strategy.id)
      ),
    [backtestTask.selectedTrendFollowingStrategies]
  );

  const columnTitles = useMemo(
    () => ({
      name: t('strategies.trendFollowing.columns.name'),
      ma_type: t('strategies.trendFollowing.columns.maType'),
      short_ma: t('strategies.trendFollowing.columns.shortMa'),
      long_ma: t('strategies.trendFollowing.columns.longMa'),
      adx_period: t('strategies.trendFollowing.columns.adxPeriod'),
      adx_threshold: t('strategies.trendFollowing.columns.adxThreshold'),
      leverage: t('strategies.trendFollowing.columns.leverage'),
      actions: t('strategies.trendFollowing.columns.actions'),
    }),
    [t]
  );

  const handleAdd = useCallback(
    (record: TrendFollowingStrategyItem) => {
      if (selectedIds.has(record.id)) return;
      onChangeBacktestTask({
        ...backtestTask,
        selectedTrendFollowingStrategies: [...backtestTask.selectedTrendFollowingStrategies, record],
      });
    },
    [backtestTask, onChangeBacktestTask, selectedIds]
  );

  const handleRemove = useCallback(
    (record: TrendFollowingStrategyItem) => {
      if (!selectedIds.has(record.id)) return;
      onChangeBacktestTask({
        ...backtestTask,
        selectedTrendFollowingStrategies: backtestTask.selectedTrendFollowingStrategies.filter(
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

  const tableSortOrder: TrendFollowingTableSortOrder | undefined =
    sortBy == null ? undefined : sortOrder === 'asc' ? 'ascend' : 'descend';

  const handleSortChange = useCallback(
    (newSortBy: TrendFollowingTableSortField | undefined, newSortOrder: TrendFollowingTableSortOrder | undefined) => {
      if (newSortBy == null || newSortOrder == null) {
        setSortBy(undefined);
        setSortOrder('asc');
      } else {
        setSortBy(newSortBy as TrendFollowingStrategySortField);
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

  const renderActions = useCallback(
    (record: TrendFollowingStrategyItem) => {
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
      <TrendFollowingTable
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
          placeholder: t('strategies.trendFollowing.searchPlaceholder'),
        }}
        toolbar={{
          clearSortLabel: t('strategies.trendFollowing.actions.clearSort'),
          onClearSort: handleClearSort,
        }}
        renderActions={renderActions}
        hiddenColumns={['timeframe', 'stop_loss', 'take_profit']}
      />
    </div>
  );
};

export default TrendFollowingStrategiesList;
