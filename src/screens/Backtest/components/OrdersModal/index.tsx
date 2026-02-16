import { useTranslation } from 'react-i18next';
import { Modal, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';

export interface OrdersModalProps {
  open: boolean;
  resultIndex: number | null;
  orders: Record<string, unknown>[];
  loading?: boolean;
  onClose: () => void;
}

const OrdersModal: FC<OrdersModalProps> = ({
  open,
  resultIndex,
  orders,
  loading = false,
  onClose,
}) => {
  const { t } = useTranslation();

  const columns: ColumnsType<Record<string, unknown>> = [
    {
      title: t('backtest.detail.orders.openTime'),
      dataIndex: 'open_time_utc',
      key: 'open_time_utc',
      width: 155,
    },
    {
      title: t('backtest.detail.orders.closeTime'),
      dataIndex: 'close_time_utc',
      key: 'close_time_utc',
      width: 155,
    },
    {
      title: t('backtest.detail.orders.type'),
      dataIndex: 'type',
      key: 'type',
      width: 70,
    },
    {
      title: t('backtest.detail.orders.openPrice'),
      dataIndex: 'open_price',
      key: 'open_price',
      width: 95,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(2) : '—'),
    },
    {
      title: t('backtest.detail.orders.closePrice'),
      dataIndex: 'close_price',
      key: 'close_price',
      width: 95,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(2) : '—'),
    },
    {
      title: t('backtest.detail.orders.targetPrice'),
      dataIndex: 'target_price',
      key: 'target_price',
      width: 95,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(2) : '—'),
    },
    {
      title: t('backtest.detail.orders.lostPrice'),
      dataIndex: 'lost_price',
      key: 'lost_price',
      width: 90,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(2) : '—'),
    },
    {
      title: t('backtest.detail.orders.size'),
      dataIndex: 'size',
      key: 'size',
      width: 80,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(4) : '—'),
    },
    {
      title: t('backtest.detail.orders.marginUsed'),
      dataIndex: 'margin_used',
      key: 'margin_used',
      width: 100,
      align: 'right',
      render: (v: number) => (v != null ? v.toFixed(2) : '—'),
    },
    {
      title: t('backtest.detail.orders.pnl'),
      dataIndex: 'pnl',
      key: 'pnl',
      width: 95,
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
      title: t('backtest.detail.orders.liquidated'),
      dataIndex: 'is_liquidated',
      key: 'is_liquidated',
      width: 90,
      align: 'center',
      render: (v: boolean) =>
        v ? (
          <Typography.Text type="danger">
            {t('backtest.detail.orders.yes')}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <Modal
      title={t('backtest.detail.ordersModalTitle', {
        index: resultIndex != null ? resultIndex + 1 : 0,
      })}
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
    >
      <Table
        columns={columns}
        dataSource={orders}
        rowKey={(_, i) => String(i)}
        loading={loading}
        pagination={{ pageSize: 10, size: 'small' }}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </Modal>
  );
};

export default OrdersModal;
