import { useState, useCallback, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import type { SelectedPairItem, UpdateSelectedPairItem } from '../../../../modules/backtest';
import AddSelectedPairsModal from './AddSelectedPairsModal';

function getMetaId(meta: SelectedPairItem['meta']): string {
  return typeof meta === 'string' ? meta : meta.id;
}

function getSymbol(meta: SelectedPairItem['meta']): string {
  if (typeof meta === 'string') return '—';
  return meta.symbol ?? '—';
}

function getInterval(meta: SelectedPairItem['meta']): string {
  if (typeof meta === 'string') return '—';
  return meta.interval ?? '—';
}

const MS_MINUTE = 60 * 1000;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;
const MS_WEEK = 7 * MS_DAY;
const MS_MONTH_APPROX = 30 * MS_DAY;

/** Parse interval string to milliseconds (e.g. "1m", "5m", "1h", "60", "D"). */
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

/** Count candles between startDate and endDate for given interval. */
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

function getTotalCandles(meta: SelectedPairItem['meta']): number | string {
  if (typeof meta === 'string') return '—';
  return meta.totalCandles ?? '—';
}

function getOldestRecordDate(meta: SelectedPairItem['meta']): string | undefined {
  if (typeof meta === 'string') return undefined;
  return meta.oldestRecordDate;
}

function getNewestRecordDate(meta: SelectedPairItem['meta']): string | undefined {
  if (typeof meta === 'string') return undefined;
  return meta.newestRecordDate;
}

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : format(d, 'dd/MM/yyyy HH:mm:ss');
  } catch {
    return value;
  }
}

export interface FuturesPairsTabProps {
  selectedPairs?: SelectedPairItem[];
  loading?: boolean;
  /** When provided, "Add pairs" button and modal are shown; required to update task. */
  onUpdateBacktestTask?: (payload: { selectedPairs: UpdateSelectedPairItem[] }) => void;
}

const FuturesPairsTab: FC<FuturesPairsTabProps> = ({
  selectedPairs = [],
  loading = false,
  onUpdateBacktestTask,
}) => {
  const { t } = useTranslation();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const currentSelectedMetaIds = useMemo(
    () => new Set(selectedPairs.map((p) => getMetaId(p.meta))),
    [selectedPairs]
  );

  const handleAddPairsConfirm = useCallback(
    (selectedPairs: UpdateSelectedPairItem[]) => {
      onUpdateBacktestTask?.({ selectedPairs });
    },
    [onUpdateBacktestTask]
  );

  const columns: ColumnsType<SelectedPairItem> = [
    {
      title: t('backtest.detail.pair'),
      key: 'pair',
      width: 140,
      sorter: (a, b) => getSymbol(a.meta).localeCompare(getSymbol(b.meta)),
      render: (_: unknown, record: SelectedPairItem) => getSymbol(record.meta),
    },
    {
      title: t('backtest.detail.timeframe'),
      key: 'timeframe',
      width: 100,
      sorter: (a, b) => getInterval(a.meta).localeCompare(getInterval(b.meta)),
      render: (_: unknown, record: SelectedPairItem) => getInterval(record.meta),
    },
    {
      title: t('backtest.detail.selectedPairs.candles'),
      key: 'totalCandles',
      width: 100,
      align: 'right',
      sorter: (a, b) => {
        const na = countCandles(a.startDate, a.endDate, getInterval(a.meta)) ?? (typeof getTotalCandles(a.meta) === 'number' ? getTotalCandles(a.meta) as number : 0);
        const nb = countCandles(b.startDate, b.endDate, getInterval(b.meta)) ?? (typeof getTotalCandles(b.meta) === 'number' ? getTotalCandles(b.meta) as number : 0);
        return na - nb;
      },
      render: (_: unknown, record: SelectedPairItem) => {
        const calculated = countCandles(record.startDate, record.endDate, getInterval(record.meta));
        if (calculated !== null) return calculated;
        return getTotalCandles(record.meta);
      },
    },
    {
      title: t('backtest.detail.selectedPairs.firstRecord'),
      key: 'oldestRecordDate',
      width: 140,
      render: (_: unknown, record: SelectedPairItem) => formatDateTime(getOldestRecordDate(record.meta)),
      sorter: (a, b) =>
        (getOldestRecordDate(a.meta) ?? '').localeCompare(getOldestRecordDate(b.meta) ?? ''),
    },
    {
      title: t('backtest.detail.selectedPairs.lastRecord'),
      key: 'newestRecordDate',
      width: 140,
      render: (_: unknown, record: SelectedPairItem) => formatDateTime(getNewestRecordDate(record.meta)),
      sorter: (a, b) =>
        (getNewestRecordDate(a.meta) ?? '').localeCompare(getNewestRecordDate(b.meta) ?? ''),
    },
    {
      title: t('backtest.detail.selectedPairs.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 140,
      render: (value: string | undefined) => formatDateTime(value),
      sorter: (a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''),
    },
    {
      title: t('backtest.detail.selectedPairs.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 140,
      render: (value: string | undefined) => formatDateTime(value),
      sorter: (a, b) => (a.endDate ?? '').localeCompare(b.endDate ?? ''),
    },
  ];

  const rowKey = (record: SelectedPairItem, index?: number) => {
    const metaId = getMetaId(record.meta);
    return `${metaId}-${record.startDate ?? ''}-${record.endDate ?? ''}-${index ?? 0}`;
  };

  return (
    <div className="futures-pairs-tab">
      {onUpdateBacktestTask && (
        <Space style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            {t('backtest.addPairsModal.title')}
          </Button>
        </Space>
      )}
      {selectedPairs.length === 0 && !loading && (
        <Typography.Text type="secondary">{t('backtest.detail.emptyFuturesPairs')}</Typography.Text>
      )}
      <Table<SelectedPairItem>
        columns={columns}
        dataSource={selectedPairs}
        rowKey={rowKey}
        loading={loading}
        pagination={false}
        size="small"
      />
      <AddSelectedPairsModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        currentSelectedMetaIds={currentSelectedMetaIds}
        onConfirm={handleAddPairsConfirm}
      />
    </div>
  );
};

export default FuturesPairsTab;
