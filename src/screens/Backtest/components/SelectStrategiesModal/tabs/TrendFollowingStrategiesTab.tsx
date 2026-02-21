import { useState, useCallback, useMemo, useEffect, useRef, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendFollowingTable } from '../../../../../components/core';
import type {
  TrendFollowingStrategyTableRow,
  TrendFollowingTableSortField,
  TrendFollowingTableSortOrder,
} from '../../../../../components/core';
import {
  useLazyGetTrendFollowingStrategiesQuery,
} from '../../../../../modules/strategies/trendFollowingStrategy';
import type {
  TrendFollowingStrategyItem,
  TrendFollowingStrategySortField,
  TrendFollowingStrategySortOrder,
} from '../../../../../modules/strategies/trendFollowingStrategy';
import type { Key } from 'react';

const BATCH_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 300;

export interface AllStrategiesTabSelection {
  selectedRowKeys: Key[];
  onChange: (selectedRowKeys: Key[], selectedRows: TrendFollowingStrategyTableRow[]) => void;
}

export interface AllStrategiesTabProps {
  selection: AllStrategiesTabSelection;
}

function itemToRow(item: TrendFollowingStrategyItem): TrendFollowingStrategyTableRow {
  return {
    id: item.id,
    name: item.name,
    timeframe: item.timeframe,
    ma_type: item.ma_type,
    short_ma: item.short_ma,
    long_ma: item.long_ma,
    adx_period: item.adx_period,
    adx_threshold: item.adx_threshold,
    stop_loss: item.stop_loss,
    take_profit: item.take_profit,
    leverage: item.leverage,
  };
}

const TrendFollowingStrategiesTab: FC<AllStrategiesTabProps> = ({ selection }) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<TrendFollowingStrategySortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<TrendFollowingStrategySortOrder>('asc');
  const [allItems, setAllItems] = useState<TrendFollowingStrategyItem[]>([]);
  const [fetchBatches, { isLoading }] = useLazyGetTrendFollowingStrategiesQuery();
  const abortRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    abortRef.current = false;
    setAllItems([]);

    const loadAll = async () => {
      const params = {
        page: 1,
        limit: BATCH_SIZE,
        ...(search.trim() && { search: search.trim() }),
        ...(sortBy != null && { sortBy, sortOrder }),
      };

      try {
        const first = await fetchBatches(params).unwrap();
        if (abortRef.current) return;
        let items = [...first.items];
        const total = first.total;

        for (let page = 2; items.length < total && !abortRef.current; page++) {
          const next = await fetchBatches({
            ...params,
            page,
          }).unwrap();
          if (abortRef.current) return;
          items = [...items, ...next.items];
        }

        if (!abortRef.current) setAllItems(items);
      } catch {
        if (!abortRef.current) setAllItems([]);
      }
    };

    loadAll();
    return () => {
      abortRef.current = true;
    };
  }, [search, sortBy, sortOrder, fetchBatches]);

  const dataSource = useMemo(() => allItems.map(itemToRow), [allItems]);

  const columnTitles = useMemo(
    () => ({
      name: t('strategies.trendFollowing.columns.name'),
      timeframe: t('strategies.trendFollowing.columns.timeframe'),
      ma_type: t('strategies.trendFollowing.columns.maType'),
      short_ma: t('strategies.trendFollowing.columns.shortMa'),
      long_ma: t('strategies.trendFollowing.columns.longMa'),
      adx_period: t('strategies.trendFollowing.columns.adxPeriod'),
      adx_threshold: t('strategies.trendFollowing.columns.adxThreshold'),
      leverage: t('strategies.trendFollowing.columns.leverage'),
    }),
    [t],
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
    },
    [],
  );

  const handleClearSort = useCallback(() => {
    setSortBy(undefined);
    setSortOrder('asc');
  }, []);

  return (
    <div style={{ padding: '8px 0' }}>
      <TrendFollowingTable
        dataSource={dataSource}
        loading={isLoading}
        columnTitles={columnTitles}
        rowKey="id"
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
        selection={selection}
      />
    </div>
  );
};

export default TrendFollowingStrategiesTab;
