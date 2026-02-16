import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Descriptions,
  Modal,
  Space,
  Table,
  Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import {
  useGetRunByIdQuery,
  useGetOrdersForResultQuery,
  type BacktestResultSummary,
  type BacktestRunError,
  type BacktestOrderRecord,
} from '../../modules/backtest';

const BacktestRunDetailPage: FC = () => {
  const { t } = useTranslation();
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [ordersModalResultIndex, setOrdersModalResultIndex] = useState<
    number | null
  >(null);

  const { data: run, isLoading, isError, error } = useGetRunByIdQuery(runId!, {
    skip: !runId,
  });
  const { data: orders, isLoading: ordersLoading } = useGetOrdersForResultQuery(
    { runId: runId!, resultIndex: ordersModalResultIndex! },
    { skip: !runId || ordersModalResultIndex === null }
  );

  const errorMessage =
    isError && error && 'message' in error ? String(error.message) : null;
  const results = run?.results ?? [];
  const errors = run?.errors ?? [];

  const resultColumns: ColumnsType<BacktestResultSummary> = [
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
      sorter: (a, b) => (a.params.name ?? '').localeCompare(b.params.name ?? ''),
      sortDirections: ['ascend', 'descend'],
      render: (_, r) => r.params.name ?? '—',
    },
    {
      title: t('backtest.detail.pair'),
      dataIndex: ['params', 'pair'],
      key: 'pair',
      width: 100,
      sorter: (a, b) => (a.params.pair ?? '').localeCompare(b.params.pair ?? ''),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('backtest.detail.timeframe'),
      dataIndex: ['params', 'timeframe'],
      key: 'timeframe',
      width: 90,
      sorter: (a, b) => (a.params.timeframe ?? '').localeCompare(b.params.timeframe ?? ''),
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
        const ratio = winning / losing;
        return ratio.toFixed(2);
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
    {
      title: t('backtest.detail.actions'),
      key: 'orders',
      width: 100,
      fixed: 'right',
      render: (_, __, index) => (
        <Button
          type="link"
          size="small"
          onClick={() => setOrdersModalResultIndex(index)}
        >
          {t('backtest.detail.viewOrders')}
        </Button>
      ),
    },
  ];

  const orderColumns: ColumnsType<BacktestOrderRecord> = [
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
      render: (v: number) => (
        v != null ? (
          <Typography.Text type={v >= 0 ? 'success' : 'danger'}>
            {v.toFixed(2)}
          </Typography.Text>
        ) : (
          '—'
        )
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
          <Typography.Text type="danger">{t('backtest.detail.orders.yes')}</Typography.Text>
        ) : (
          '—'
        ),
    },
  ];

  if (!runId) {
    return null;
  }

  return (
    <>
      <AppHeaderContainer>
        <div className="backtest-detail-page__header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/backtest')}
          >
            {t('backtest.detail.backToList')}
          </Button>
          <h1 className="backtest-detail-page__title">
            {t('backtest.detail.title')} {runId}
          </h1>
        </div>
      </AppHeaderContainer>
      <AppContainer>
        <div className="backtest-detail-page">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              className="backtest-detail-page__error"
            />
          )}
          {run && (
            <>
              <Descriptions bordered size="small" column={1} className="backtest-detail-page__meta">
                <Descriptions.Item label={t('backtest.columns.id')}>
                  {run.id}
                </Descriptions.Item>
                <Descriptions.Item label={t('backtest.columns.createdAt')}>
                  {run.createdAt
                    ? format(new Date(run.createdAt), 'dd/MM/yyyy HH:mm:ss')
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('backtest.columns.updatedAt')}>
                  {run.updatedAt
                    ? format(new Date(run.updatedAt), 'dd/MM/yyyy HH:mm:ss')
                    : '—'}
                </Descriptions.Item>
              </Descriptions>

              <Typography.Title level={5} style={{ marginTop: 24 }}>
                {t('backtest.detail.resultsSection')} ({results.length})
              </Typography.Title>
              <Table<BacktestResultSummary>
                columns={resultColumns}
                dataSource={results}
                rowKey={(_, i) => String(i)}
                loading={isLoading}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />

              {errors.length > 0 && (
                <>
                  <Typography.Title level={5} style={{ marginTop: 24 }}>
                    {t('backtest.detail.errorsSection')} ({errors.length})
                  </Typography.Title>
                  <Space direction="vertical" size="small">
                    {errors.map((err: BacktestRunError, i: number) => (
                      <Alert
                        key={i}
                        type="error"
                        showIcon
                        message={err.name}
                        description={err.error}
                      />
                    ))}
                  </Space>
                </>
              )}
            </>
          )}
        </div>
      </AppContainer>

      <Modal
        title={t('backtest.detail.ordersModalTitle', {
          index: ordersModalResultIndex != null ? ordersModalResultIndex + 1 : 0,
        })}
        open={ordersModalResultIndex !== null}
        onCancel={() => setOrdersModalResultIndex(null)}
        footer={null}
        width={960}
      >
        <Table<BacktestOrderRecord>
          columns={orderColumns}
          dataSource={orders ?? []}
          rowKey={(_, i) => String(i)}
          loading={ordersLoading}
          pagination={{ pageSize: 10, size: 'small' }}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </Modal>
    </>
  );
};

export default BacktestRunDetailPage;
