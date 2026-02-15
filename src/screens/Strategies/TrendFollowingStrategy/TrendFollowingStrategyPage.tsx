import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, message, Space, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import AppContainer from '../../../components/layout/AppContainer';
import AppHeaderContainer from '../../../components/layout/AppHeaderContainer';
import './TrendFollowingStrategyPage.css';
import {
  useGetTrendFollowingStrategiesQuery,
  useDeleteTrendFollowingStrategyMutation,
} from '../../../modules/strategies/trendFollowingStrategy';
import type { TrendFollowingStrategyItem } from '../../../modules/strategies/trendFollowingStrategy';
import { TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS } from '../../../modules/strategies/trendFollowingStrategy';

const DEFAULT_PAGE_SIZE = TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS.limit;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TrendFollowingStrategyPage: FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isError, error } = useGetTrendFollowingStrategiesQuery({ page, limit });
  const errorMessage = isError && error && 'message' in error ? String(error.message) : null;
  const [deleteStrategy, { isLoading: isDeleting }] = useDeleteTrendFollowingStrategyMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: ColumnsType<TrendFollowingStrategyItem> = [
    {
      title: t('strategies.trendFollowing.columns.name'),
      dataIndex: 'name',
      key: 'name',
      width: 140,
      ellipsis: true,
      sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
    },
    {
      title: t('strategies.trendFollowing.columns.timeframe'),
      dataIndex: 'timeframe',
      key: 'timeframe',
      width: 100,
      sorter: (a, b) => (a.timeframe ?? '').localeCompare(b.timeframe ?? ''),
    },
    {
      title: t('strategies.trendFollowing.columns.maType'),
      dataIndex: 'ma_type',
      key: 'ma_type',
      width: 90,
      sorter: (a, b) => (a.ma_type ?? '').localeCompare(b.ma_type ?? ''),
    },
    {
      title: t('strategies.trendFollowing.columns.shortMa'),
      dataIndex: 'short_ma',
      key: 'short_ma',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.short_ma ?? 0) - (b.short_ma ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.longMa'),
      dataIndex: 'long_ma',
      key: 'long_ma',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.long_ma ?? 0) - (b.long_ma ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.adxPeriod'),
      dataIndex: 'adx_period',
      key: 'adx_period',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.adx_period ?? 0) - (b.adx_period ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.adxThreshold'),
      dataIndex: 'adx_threshold',
      key: 'adx_threshold',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.adx_threshold ?? 0) - (b.adx_threshold ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.stopLoss'),
      dataIndex: 'stop_loss',
      key: 'stop_loss',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.stop_loss ?? 0) - (b.stop_loss ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.takeProfit'),
      dataIndex: 'take_profit',
      key: 'take_profit',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.take_profit ?? 0) - (b.take_profit ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.leverage'),
      dataIndex: 'leverage',
      key: 'leverage',
      width: 90,
      align: 'right',
      sorter: (a, b) => (a.leverage ?? 0) - (b.leverage ?? 0),
    },
    {
      title: t('strategies.trendFollowing.columns.actions'),
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleDelete = async (record: TrendFollowingStrategyItem) => {
    try {
      await deleteStrategy(record.id).unwrap();
      message.success(t('strategies.trendFollowing.messages.rowDeleted'));
    } catch {
      message.error(t('strategies.trendFollowing.messages.deleteError'));
    }
  };

  const handleTableChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  };

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
          <Table<TrendFollowingStrategyItem>
            columns={columns}
            dataSource={items}
            rowKey="id"
            loading={isLoading || isDeleting}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (totalCount) => t('common.paginationTotal', { total: totalCount }),
              onChange: handleTableChange,
            }}
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </AppContainer>
    </>
  );
};

export default TrendFollowingStrategyPage;
