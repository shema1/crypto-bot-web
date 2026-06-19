import { useTranslation } from 'react-i18next';
import { Modal, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useState, type FC } from 'react';
import {
  useGetTaskResultTradesQuery,
  formatTradeHistoryTimeLocal,
  type BacktestTaskResultItem,
  type BacktestTradeRecord,
} from '../../../../modules/backtest';

export interface OrdersModalProps {
  open: boolean;
  taskId: string;
  result: BacktestTaskResultItem | null;
  onClose: () => void;
}

const OrdersModal: FC<OrdersModalProps> = ({ open, taskId, result, onClose }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data, isLoading, isFetching } = useGetTaskResultTradesQuery(
    {
      taskId,
      resultId: result?.id ?? '',
      query: { page, limit: pageSize },
    },
    { skip: !open || !result?.id },
  );

  const columns: ColumnsType<BacktestTradeRecord> = [
    {
      title: '#',
      dataIndex: 'ticket',
      key: 'ticket',
      width: 60,
    },
    {
      title: t('backtest.detail.orders.type'),
      dataIndex: 'type',
      key: 'type',
      width: 70,
    },
    {
      title: t('backtest.detail.orders.openTime'),
      dataIndex: 'entry_time',
      key: 'entry_time',
      width: 170,
      render: (value: string) => formatTradeHistoryTimeLocal(value),
    },
    {
      title: t('backtest.detail.orders.closeTime'),
      dataIndex: 'exit_time',
      key: 'exit_time',
      width: 170,
      render: (value: string) => formatTradeHistoryTimeLocal(value),
    },
    {
      title: t('backtest.detail.orders.openPrice'),
      dataIndex: 'entry_price',
      key: 'entry_price',
      width: 100,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(4) : '—'),
    },
    {
      title: t('backtest.detail.orders.closePrice'),
      dataIndex: 'exit_price',
      key: 'exit_price',
      width: 100,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(4) : '—'),
    },
    {
      title: t('backtest.detail.orders.pnl'),
      dataIndex: 'pnl',
      key: 'pnl',
      width: 100,
      align: 'right',
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
      title: t('backtest.detail.results.pnlPct'),
      dataIndex: 'pnl_pct',
      key: 'pnl_pct',
      width: 90,
      align: 'right',
      render: (v: number) =>
        v != null ? (
          <Typography.Text type={v >= 0 ? 'success' : 'danger'}>
            {v.toFixed(2)}%
          </Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('backtest.detail.results.exitReason'),
      dataIndex: 'exit_reason',
      key: 'exit_reason',
      width: 100,
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 50);
  };

  const titleLabel = result
    ? `${result.pair} ${result.timeframe} (#${result.subtaskIndex})`
    : '';

  return (
    <Modal
      title={t('backtest.detail.ordersModalTitle', { label: titleLabel })}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnHidden
    >
      <Table<BacktestTradeRecord>
        columns={columns}
        dataSource={data?.items ?? []}
        rowKey={(row) => String(row.ticket)}
        loading={isLoading || isFetching}
        pagination={{
          current: data?.page ?? page,
          pageSize: data?.limit ?? pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100', '200'],
          showTotal: (total) => t('backtest.detail.results.tradesTotal', { total }),
        }}
        onChange={handleTableChange}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </Modal>
  );
};

export default OrdersModal;
