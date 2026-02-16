import { useTranslation } from 'react-i18next';
import { Button, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import type { ResultSummary } from '../types';

export interface ResultSummariesTableProps {
  dataSource: ResultSummary[];
  loading?: boolean;
  onViewOrders?: (resultIndex: number) => void;
}

const ResultSummariesTable: FC<ResultSummariesTableProps> = ({
  dataSource,
  loading = false,
  onViewOrders,
}) => {
  const { t } = useTranslation();

  const columns: ColumnsType<ResultSummary> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: t('backtest.detail.resultName'),
      key: 'name',
      width: 140,
      ellipsis: true,
      sorter: (a, b) => (a.params?.name ?? '').localeCompare(b.params?.name ?? ''),
      sortDirections: ['ascend', 'descend'],
      render: (_, r) => r.params?.name ?? '—',
    },
    {
      title: t('backtest.detail.pair'),
      dataIndex: ['params', 'pair'],
      key: 'pair',
      width: 100,
      sorter: (a, b) => (a.params?.pair ?? '').localeCompare(b.params?.pair ?? ''),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('backtest.detail.timeframe'),
      dataIndex: ['params', 'timeframe'],
      key: 'timeframe',
      width: 90,
      sorter: (a, b) => (a.params?.timeframe ?? '').localeCompare(b.params?.timeframe ?? ''),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('backtest.detail.totalOrders'),
      dataIndex: 'total_orders',
      key: 'total_orders',
      width: 90,
      align: 'right',
      sorter: (a, b) => (a.total_orders ?? 0) - (b.total_orders ?? 0),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('backtest.detail.winningOrders'),
      dataIndex: 'winning_orders',
      key: 'winning_orders',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.winning_orders ?? 0) - (b.winning_orders ?? 0),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('backtest.detail.losingOrders'),
      dataIndex: 'losing_orders',
      key: 'losing_orders',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.losing_orders ?? 0) - (b.losing_orders ?? 0),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('backtest.detail.winLoseRatio'),
      key: 'win_lose_ratio',
      width: 100,
      align: 'right',
      sorter: (a, b) => {
        const losingA = a.losing_orders ?? 0;
        const losingB = b.losing_orders ?? 0;
        const ratioA = losingA > 0 ? (a.winning_orders ?? 0) / losingA : Infinity;
        const ratioB = losingB > 0 ? (b.winning_orders ?? 0) / losingB : Infinity;
        return ratioA - ratioB;
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, r) => {
        const losing = r.losing_orders ?? 0;
        const winning = r.winning_orders ?? 0;
        if (losing === 0) return winning > 0 ? '∞' : '—';
        return (winning / losing).toFixed(2);
      },
    },
    {
      title: t('backtest.detail.netResult'),
      dataIndex: 'net_result',
      key: 'net_result',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.net_result ?? 0) - (b.net_result ?? 0),
      sortDirections: ['ascend', 'descend'],
      render: (v: number) =>
        v != null ? (
          <Typography.Text type={v >= 0 ? 'success' : 'danger'}>
            {v.toFixed(2)}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('backtest.detail.winRate'),
      dataIndex: 'win_rate',
      key: 'win_rate',
      width: 90,
      align: 'right',
      sorter: (a, b) => (a.win_rate ?? 0) - (b.win_rate ?? 0),
      sortDirections: ['ascend', 'descend'],
      render: (v: number) => (v != null ? `${(v * 100).toFixed(1)}%` : '—'),
    },
  ];

  if (onViewOrders) {
    columns.push({
      title: t('backtest.detail.actions'),
      key: 'orders',
      width: 100,
      fixed: 'right',
      render: (_: unknown, __: ResultSummary, index: number) => (
        <Button
          type="link"
          size="small"
          onClick={() => onViewOrders(index)}
        >
          {t('backtest.detail.viewOrders')}
        </Button>
      ),
    });
  }

  return (
    <Table<ResultSummary>
      columns={columns}
      dataSource={dataSource}
      rowKey={(_, i) => String(i)}
      loading={loading}
      pagination={false}
      size="small"
      scroll={{ x: 'max-content' }}
    />
  );
};

export default ResultSummariesTable;
