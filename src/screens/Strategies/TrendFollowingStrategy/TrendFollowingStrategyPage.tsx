import { useState, useCallback, useMemo, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Input, message, Space, Table } from 'antd';
import { ClearOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import AppContainer from '../../../components/layout/AppContainer';
import AppHeaderContainer from '../../../components/layout/AppHeaderContainer';
import './TrendFollowingStrategyPage.css';
import {
  useGetTrendFollowingStrategiesQuery,
  useDeleteTrendFollowingStrategyMutation,
} from '../../../modules/strategies/trendFollowingStrategy';
import type {
  TrendFollowingStrategyItem,
  TrendFollowingStrategySortField,
  TrendFollowingStrategySortOrder,
} from '../../../modules/strategies/trendFollowingStrategy';
import { TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS } from '../../../modules/strategies/trendFollowingStrategy';

const DEFAULT_PAGE_SIZE = TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS.limit;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TrendFollowingStrategyPage: FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<TrendFollowingStrategySortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<TrendFollowingStrategySortOrder>('asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() && { search: search.trim() }),
      ...(sortBy != null && { sortBy, sortOrder }),
    }),
    [page, limit, search, sortBy, sortOrder],
  );
  const { data, isLoading, isError, error } = useGetTrendFollowingStrategiesQuery(queryParams);
  const errorMessage = isError && error && 'message' in error ? String(error.message) : null;
  const [deleteStrategy, { isLoading: isDeleting }] = useDeleteTrendFollowingStrategyMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const getColumnSortOrder = useCallback(
    (columnKey: string): 'ascend' | 'descend' | undefined => {
      if (sortBy == null || sortBy !== columnKey) return undefined;
      return sortOrder === 'asc' ? 'ascend' : 'descend';
    },
    [sortBy, sortOrder],
  );

  const columns: ColumnsType<TrendFollowingStrategyItem> = [
    {
      title: t('strategies.trendFollowing.columns.name'),
      dataIndex: 'name',
      key: 'name',
      width: 140,
      ellipsis: true,
      sorter: true,
      sortOrder: getColumnSortOrder('name'),
    },

    {
      title: t('strategies.trendFollowing.columns.maType'),
      dataIndex: 'ma_type',
      key: 'ma_type',
      width: 90,
      sorter: true,
      sortOrder: getColumnSortOrder('ma_type'),
    },
    {
      title: t('strategies.trendFollowing.columns.shortMa'),
      dataIndex: 'short_ma',
      key: 'short_ma',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: getColumnSortOrder('short_ma'),
    },
    {
      title: t('strategies.trendFollowing.columns.longMa'),
      dataIndex: 'long_ma',
      key: 'long_ma',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: getColumnSortOrder('long_ma'),
    },
    {
      title: t('strategies.trendFollowing.columns.adxPeriod'),
      dataIndex: 'adx_period',
      key: 'adx_period',
      width: 110,
      align: 'right',
      sorter: true,
      sortOrder: getColumnSortOrder('adx_period'),
    },
    {
      title: t('strategies.trendFollowing.columns.adxThreshold'),
      dataIndex: 'adx_threshold',
      key: 'adx_threshold',
      width: 120,
      align: 'right',
      sorter: true,
      sortOrder: getColumnSortOrder('adx_threshold'),
    },
    {
      title: t('strategies.trendFollowing.columns.leverage'),
      dataIndex: 'leverage',
      key: 'leverage',
      width: 90,
      align: 'right',
      sorter: true,
      sortOrder: getColumnSortOrder('leverage'),
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

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  }, [limit]);

  const handleTableChange = useCallback(
    (
      _pagination: { current?: number; pageSize?: number },
      _filters: unknown,
      sorter: SorterResult<TrendFollowingStrategyItem> | SorterResult<TrendFollowingStrategyItem>[],
    ) => {
      const single = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!single?.columnKey) return;
      const order = single.order;
      if (order === 'ascend' || order === 'descend') {
        const field = single.columnKey as TrendFollowingStrategySortField;
        if (['name', 'ma_type', 'short_ma', 'long_ma', 'adx_period', 'adx_threshold', 'leverage'].includes(field)) {
          setSortBy(field);
          setSortOrder(order === 'ascend' ? 'asc' : 'desc');
          setPage(1);
        }
      } else {
        setSortBy(undefined);
        setSortOrder('asc');
        setPage(1);
      }
    },
    [],
  );

  const handleClearSort = useCallback(() => {
    setSortBy(undefined);
    setSortOrder('asc');
    setPage(1);
  }, []);

  const isSortedByColumn = sortBy != null;

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
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder={t('strategies.trendFollowing.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              allowClear
              className="trend-following-strategy-page__search"
              style={{ maxWidth: 400 }}
            />
            {isSortedByColumn && (
              <Button icon={<ClearOutlined />} onClick={handleClearSort}>
                {t('strategies.trendFollowing.actions.clearSort')}
              </Button>
            )}
          </div>
          <Table<TrendFollowingStrategyItem>
            columns={columns}
            dataSource={items}
            rowKey="id"
            loading={isLoading || isDeleting}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (totalCount) => t('common.paginationTotal', { total: totalCount }),
              onChange: handlePaginationChange,
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
