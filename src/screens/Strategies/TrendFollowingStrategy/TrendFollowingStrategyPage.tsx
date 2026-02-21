import { useState, useCallback, useMemo, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, message } from 'antd';
import AppContainer from '../../../components/layout/AppContainer';
import AppHeaderContainer from '../../../components/layout/AppHeaderContainer';
import { TrendFollowingTable } from '../../../components/core';
import type {
  TrendFollowingTableSortField,
  TrendFollowingTableSortOrder,
} from '../../../components/core';
import './TrendFollowingStrategyPage.css';
import {
  useGetTrendFollowingStrategiesQuery,
  useDeleteTrendFollowingStrategyMutation,
} from '../../../modules/strategies/trendFollowingStrategy';
import type {
  TrendFollowingStrategyItem,
  TrendFollowingStrategySortField,
  TrendFollowingStrategySortOrder,
} from '../../../modules/strategies/trendFollowingStrategy';
import { TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS } from '../../../modules/strategies/trendFollowingStrategy';

const DEFAULT_PAGE_SIZE = TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS.limit;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TrendFollowingStrategyPage: FC = () => {
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
    [page, limit, search, sortBy, sortOrder],
  );
  const { data, isLoading, isError, error } = useGetTrendFollowingStrategiesQuery(queryParams);
  const errorMessage = isError && error && 'message' in error ? String(error.message) : null;
  const [deleteStrategy, { isLoading: isDeleting }] = useDeleteTrendFollowingStrategyMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

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
    [t],
  );

  const handleDelete = useCallback(
    async (record: TrendFollowingStrategyItem) => {
      try {
        await deleteStrategy(record.id).unwrap();
        message.success(t('strategies.trendFollowing.messages.rowDeleted'));
      } catch {
        message.error(t('strategies.trendFollowing.messages.deleteError'));
      }
    },
    [deleteStrategy, t],
  );

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  }, [limit]);

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
    [],
  );

  const handleClearSort = useCallback(() => {
    setSortBy(undefined);
    setSortOrder('asc');
    setPage(1);
  }, []);

  return (
    <>
      <AppHeaderContainer>
        <h1 className="trend-following-strategy-page__title">
          {t('strategies.trendFollowing.title')}
        </h1>
      </AppHeaderContainer>
      <AppContainer>
        <div className="trend-following-strategy-page">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              className="trend-following-strategy-page__error"
            />
          )}
          <TrendFollowingTable
            dataSource={items}
            loading={isLoading || isDeleting}
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
            onDelete={(record) => handleDelete(record as TrendFollowingStrategyItem)}
            hiddenColumns={['timeframe', 'stop_loss', 'take_profit']}
          />
        </div>
      </AppContainer>
    </>
  );
};

export default TrendFollowingStrategyPage;
