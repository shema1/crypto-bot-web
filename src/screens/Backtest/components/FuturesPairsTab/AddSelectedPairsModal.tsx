import { useState, useCallback, useMemo, useEffect, useRef, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Table, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DatePicker } from '../../../../components/core';
import { useLazyGetMetaQuery } from '../../../../modules/historicPairsMeta/apis';
import type { HistoricPairMetaItem } from '../../../../modules/historicPairsMeta/types/HistoricPairData.type';
import type { UpdateSelectedPairItem } from '../../../../modules/backtest';
import { format } from 'date-fns';

export interface AddSelectedPairsModalProps {
  open: boolean;
  onClose: () => void;
  /** Meta ids already in task.selectedPairs (will be disabled in table). */
  currentSelectedMetaIds: Set<string>;
  onConfirm: (items: UpdateSelectedPairItem[]) => void;
}

const BATCH_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : format(d, 'dd/MM/yyyy HH:mm:ss');
  } catch {
    return value;
  }
}

function matchesSearch(item: HistoricPairMetaItem, searchLower: string): boolean {
  if (!searchLower) return true;
  const symbol = (item.symbol ?? '').toLowerCase();
  const interval = (item.interval ?? '').toLowerCase();
  const provider = (item.provider ?? '').toLowerCase();
  return symbol.includes(searchLower) || interval.includes(searchLower) || provider.includes(searchLower);
}

const MS_MINUTE = 60 * 1000;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;
const MS_WEEK = 7 * MS_DAY;
const MS_MONTH_APPROX = 30 * MS_DAY;

function intervalToMs(interval: string): number | null {
  const s = (interval ?? '').trim();
  if (!s) return null;
  const numMatch = s.match(/^(\d+)([mhdw])?$/i);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    const unit = (numMatch[2] ?? '').toLowerCase();
    if (unit === 'm') return n * MS_MINUTE;
    if (unit === 'h') return n * MS_HOUR;
    if (unit === 'd') return n * MS_DAY;
    if (unit === 'w') return n * MS_WEEK;
    return n * MS_MINUTE;
  }
  if (/^d$/i.test(s)) return MS_DAY;
  if (/^w$/i.test(s)) return MS_WEEK;
  if (/^m$/i.test(s)) return MS_MONTH_APPROX;
  return null;
}

function countCandles(
  startDate: string | undefined,
  endDate: string | undefined,
  interval: string | undefined
): number | null {
  if (!startDate || !endDate || !interval) return null;
  const ms = intervalToMs(interval);
  if (!ms || ms <= 0) return null;
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return null;
  return Math.floor((endMs - startMs) / ms);
}

const AddSelectedPairsModal: FC<AddSelectedPairsModalProps> = ({
  open,
  onClose,
  currentSelectedMetaIds,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [allItems, setAllItems] = useState<HistoricPairMetaItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dateOverrides, setDateOverrides] = useState<Record<string, { startDate?: string; endDate?: string }>>({});
  const [fetchBatches, { isLoading }] = useLazyGetMetaQuery();
  const abortRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // When modal opens, pre-select pairs that are already in the task (so user can deselect them)
  useEffect(() => {
    if (open) {
      setSelectedRowKeys(Array.from(currentSelectedMetaIds));
    }
  }, [open, currentSelectedMetaIds]);

  // Fetch full list once when modal opens
  useEffect(() => {
    if (!open) {
      hasFetchedRef.current = false;
      setAllItems([]);
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    abortRef.current = false;

    const loadAll = async () => {
      const params = { page: 1, limit: BATCH_SIZE };
      try {
        const first = await fetchBatches(params).unwrap();
        if (abortRef.current) return;
        let items = [...first.items];
        const total = first.total;

        for (let page = 2; items.length < total && !abortRef.current; page++) {
          const next = await fetchBatches({ ...params, page }).unwrap();
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
  }, [open, fetchBatches]);

  // Local filter by search (no API)
  const searchLower = inputValue.trim().toLowerCase();
  const filteredItems = useMemo(
    () => (searchLower ? allItems.filter((item) => matchesSearch(item, searchLower)) : allItems),
    [allItems, searchLower]
  );

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    if (newPageSize !== pageSize) setPage(1);
  }, [pageSize]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchLower]);

  const setStartDateOverride = useCallback((id: string, value: dayjs.Dayjs | null) => {
    setDateOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], startDate: value ? value.toISOString() : undefined },
    }));
  }, []);

  const setEndDateOverride = useCallback((id: string, value: dayjs.Dayjs | null) => {
    setDateOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], endDate: value ? value.toISOString() : undefined },
    }));
  }, []);

  const columns: ColumnsType<HistoricPairMetaItem> = useMemo(
    () => [
      {
        title: t('backtest.detail.pair'),
        dataIndex: 'symbol',
        key: 'symbol',
        width: 120,
        sorter: (a, b) => (a.symbol ?? '').localeCompare(b.symbol ?? ''),
      },
      {
        title: t('backtest.detail.timeframe'),
        dataIndex: 'interval',
        key: 'interval',
        width: 90,
        sorter: (a, b) => (a.interval ?? '').localeCompare(b.interval ?? ''),
      },
      {
        title: t('backtest.detail.selectedPairs.candles'),
        key: 'totalCandles',
        width: 100,
        align: 'right',
        sorter: (a, b) => {
          const startA = dateOverrides[a.id]?.startDate ?? a.oldestRecordDate;
          const endA = dateOverrides[a.id]?.endDate ?? a.newestRecordDate;
          const startB = dateOverrides[b.id]?.startDate ?? b.oldestRecordDate;
          const endB = dateOverrides[b.id]?.endDate ?? b.newestRecordDate;
          const na = countCandles(startA, endA, a.interval) ?? a.totalCandles ?? 0;
          const nb = countCandles(startB, endB, b.interval) ?? b.totalCandles ?? 0;
          return na - nb;
        },
        render: (_: unknown, record: HistoricPairMetaItem) => {
          const start = dateOverrides[record.id]?.startDate ?? record.oldestRecordDate;
          const end = dateOverrides[record.id]?.endDate ?? record.newestRecordDate;
          const calculated = countCandles(start, end, record.interval);
          if (calculated !== null) return calculated;
          return record.totalCandles ?? '—';
        },
      },
      {
        title: t('backtest.detail.selectedPairs.firstRecord'),
        dataIndex: 'oldestRecordDate',
        key: 'oldestRecordDate',
        width: 140,
        render: (value: string | undefined) => formatDateTime(value),
        sorter: (a, b) => (a.oldestRecordDate ?? '').localeCompare(b.oldestRecordDate ?? ''),
      },
      {
        title: t('backtest.detail.selectedPairs.lastRecord'),
        dataIndex: 'newestRecordDate',
        key: 'newestRecordDate',
        width: 140,
        render: (value: string | undefined) => formatDateTime(value),
        sorter: (a, b) => (a.newestRecordDate ?? '').localeCompare(b.newestRecordDate ?? ''),
      },
      {
        title: t('backtest.detail.selectedPairs.startDate'),
        key: 'startDate',
        width: 180,
        render: (_: unknown, record: HistoricPairMetaItem) => {
          const oldest = record.oldestRecordDate ? dayjs(record.oldestRecordDate) : null;
          const newest = record.newestRecordDate ? dayjs(record.newestRecordDate) : null;
          const endLimit = dateOverrides[record.id]?.endDate ? dayjs(dateOverrides[record.id].endDate) : newest;
          const value = dateOverrides[record.id]?.startDate ?? record.oldestRecordDate;
          return (
            <DatePicker
              showTime
              allowClear={false}
              style={{ width: '100%' }}
              size="small"
              value={value ? dayjs(value) : null}
              disabledDate={(current) => {
                if (!current) return false;
                if (oldest && current.isBefore(oldest, 'day')) return true;
                if (endLimit && current.isAfter(endLimit, 'day')) return true;
                return false;
              }}
              onChange={(val) => setStartDateOverride(record.id, val as dayjs.Dayjs | null)}
            />
          );
        },
      },
      {
        title: t('backtest.detail.selectedPairs.endDate'),
        key: 'endDate',
        width: 180,
        render: (_: unknown, record: HistoricPairMetaItem) => {
          const oldest = record.oldestRecordDate ? dayjs(record.oldestRecordDate) : null;
          const newest = record.newestRecordDate ? dayjs(record.newestRecordDate) : null;
          const startLimit = dateOverrides[record.id]?.startDate ? dayjs(dateOverrides[record.id].startDate) : oldest;
          const value = dateOverrides[record.id]?.endDate ?? record.newestRecordDate;
          return (
            <DatePicker
              showTime
              allowClear={false}
              style={{ width: '100%' }}
              size="small"
              value={value ? dayjs(value) : null}
              disabledDate={(current) => {
                if (!current) return false;
                if (startLimit && current.isBefore(startLimit, 'day')) return true;
                if (newest && current.isAfter(newest, 'day')) return true;
                return false;
              }}
              onChange={(val) => setEndDateOverride(record.id, val as dayjs.Dayjs | null)}
            />
          );
        },
      },
      {
        title: t('backtest.addPairsModal.provider'),
        dataIndex: 'provider',
        key: 'provider',
        width: 90,
        sorter: (a, b) => (a.provider ?? '').localeCompare(b.provider ?? ''),
      },
    ],
    [t, dateOverrides, setStartDateOverride, setEndDateOverride]
  );

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    }),
    [selectedRowKeys]
  );

  const handleClose = useCallback(() => {
    setSelectedRowKeys([]);
    setInputValue('');
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setDateOverrides({});
    hasFetchedRef.current = false;
    setAllItems([]);
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    const fullList: UpdateSelectedPairItem[] = selectedRowKeys
      .filter((key): key is string => typeof key === 'string')
      .map((idStr) => {
        const item = allItems.find((i) => i.id === idStr);
        const override = dateOverrides[idStr];
        return {
          id: idStr,
          startDate: override?.startDate ?? item?.oldestRecordDate,
          endDate: override?.endDate ?? item?.newestRecordDate,
        };
      });
    onConfirm(fullList);
    handleClose();
  }, [selectedRowKeys, allItems, dateOverrides, onConfirm, handleClose]);

  return (
    <Modal
      title={t('backtest.addPairsModal.title')}
      open={open}
      onCancel={handleClose}
      onOk={handleConfirm}
      okText={t('backtest.addPairsModal.addSelected', { count: selectedRowKeys.length })}
      cancelText={t('backtest.selectStrategiesModal.footer.cancel')}
      okButtonProps={{}}
      width={'80vw'}
      destroyOnHidden
    >
      <Input.Search
        placeholder={t('backtest.addPairsModal.searchPlaceholder')}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />
      <Table<HistoricPairMetaItem>
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{
          current: page,
          pageSize,
          total: filteredItems.length,
          onChange: handlePaginationChange,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (total) => t('common.paginationTotal', { total }),
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default AddSelectedPairsModal;
