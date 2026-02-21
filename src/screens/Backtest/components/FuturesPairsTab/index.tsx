import { useTranslation } from 'react-i18next';
import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import type { SelectedPairItem } from '../../../../modules/backtest';

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

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  } catch {
    return value;
  }
}

export interface FuturesPairsTabProps {
  selectedPairs?: SelectedPairItem[];
  loading?: boolean;
}

const FuturesPairsTab: FC<FuturesPairsTabProps> = ({ selectedPairs = [], loading = false }) => {
  const { t } = useTranslation();

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
      title: t('backtest.detail.selectedPairs.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (value: string | undefined) => formatDate(value),
      sorter: (a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''),
    },
    {
      title: t('backtest.detail.selectedPairs.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (value: string | undefined) => formatDate(value),
      sorter: (a, b) => (a.endDate ?? '').localeCompare(b.endDate ?? ''),
    },
  ];

  const rowKey = (record: SelectedPairItem, index?: number) => {
    const metaId = getMetaId(record.meta);
    return `${metaId}-${record.startDate ?? ''}-${record.endDate ?? ''}-${index ?? 0}`;
  };

  return (
    <div className="futures-pairs-tab">
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
    </div>
  );
};

export default FuturesPairsTab;
