import { useState, useCallback, useMemo, useEffect, useRef, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { BreakoutStrategyTable } from '../../../../../components/core';
import type {
  BreakoutStrategyTableRow,
  BreakoutStrategyTableSortField,
  BreakoutStrategyTableSortOrder,
} from '../../../../../components/core';
import { useLazyGetBreakoutStrategiesQuery } from '../../../../../modules/strategies/breakoutStrategy';
import type {
  BreakoutStrategyItem,
  BreakoutStrategySortField,
  BreakoutStrategySortOrder,
} from '../../../../../modules/strategies/breakoutStrategy';
import type { Key } from 'react';

const BATCH_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 300;

export interface BreakoutStrategiesTabSelection {
  selectedRowKeys: Key[];
  onChange: (selectedRowKeys: Key[], selectedRows: BreakoutStrategyTableRow[]) => void;
}

export interface BreakoutStrategiesTabProps {
  selection: BreakoutStrategiesTabSelection;
}

function itemToRow(item: BreakoutStrategyItem): BreakoutStrategyTableRow {
  return {
    id: item.id,
    name: item.name,
    strategy: item.strategy,
    lookback_period: item.lookback_period,
    breakout_buffer: item.breakout_buffer,
    min_volume_ratio: item.min_volume_ratio,
    leverage: item.leverage,
  };
}

const BreakoutStrategiesTab: FC<BreakoutStrategiesTabProps> = ({ selection }) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<BreakoutStrategySortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<BreakoutStrategySortOrder>('asc');
  const [allItems, setAllItems] = useState<BreakoutStrategyItem[]>([]);
  const [fetchBatches, { isLoading }] = useLazyGetBreakoutStrategiesQuery();
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
      name: t('strategies.breakout.columns.name'),
      lookback_period: t('strategies.breakout.columns.lookbackPeriod'),
      breakout_buffer: t('strategies.breakout.columns.breakoutBuffer'),
      min_volume_ratio: t('strategies.breakout.columns.minVolumeRatio'),
      leverage: t('strategies.breakout.columns.leverage'),
    }),
    [t],
  );

  const tableSortOrder: BreakoutStrategyTableSortOrder | undefined =
    sortBy == null ? undefined : sortOrder === 'asc' ? 'ascend' : 'descend';

  const handleSortChange = useCallback(
    (
      newSortBy: BreakoutStrategyTableSortField | undefined,
      newSortOrder: BreakoutStrategyTableSortOrder | undefined,
    ) => {
      if (newSortBy == null || newSortOrder == null) {
        setSortBy(undefined);
        setSortOrder('asc');
      } else {
        setSortBy(newSortBy as BreakoutStrategySortField);
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
      <BreakoutStrategyTable
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
          placeholder: t('strategies.breakout.searchPlaceholder'),
        }}
        toolbar={{
          clearSortLabel: t('strategies.breakout.actions.clearSort'),
          onClearSort: handleClearSort,
        }}
        selection={selection}
      />
    </div>
  );
};

export default BreakoutStrategiesTab;
