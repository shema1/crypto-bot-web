import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
  useGetTaskResultsQuery,
  type BacktestTaskResultItem,
  type GetTaskResultsQuery,
  type TaskResultSortField,
} from '../../../../modules/backtest';
import { API_BASE_URL } from '../../../../modules/core/baseQueries/mainBaseQuery';
import { backtestUrls } from '../../../../modules/backtest/apis/backtest.api';
import ResultsFilters from './ResultsFilters';
import './ResultsTab.css';

export interface ResultsTabProps {
  taskId: string;
  isRunning?: boolean;
  onViewTrades: (result: BacktestTaskResultItem) => void;
}

const SORT_FIELD_MAP: Record<string, TaskResultSortField> = {
  roiPct: 'roi_pct',
  netProfit: 'net_profit',
  winRatePct: 'win_rate_pct',
  sharpeRatio: 'sharpe_ratio',
  profitFactor: 'profit_factor',
  totalTrades: 'total_trades',
  tradesPerMonth: 'trades_per_month',
  maxDrawdownPct: 'max_drawdown_pct',
  subtaskIndex: 'subtask_index',
};

const DEFAULT_QUERY: GetTaskResultsQuery = {
  sortBy: 'roi_pct',
  sortOrder: 'desc',
  status: 'completed',
  page: 1,
  limit: 20,
};

const ResultsTab: FC<ResultsTabProps> = ({ taskId, isRunning, onViewTrades }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<GetTaskResultsQuery>(DEFAULT_QUERY);
  const { data, isLoading, isFetching, refetch } = useGetTaskResultsQuery({ taskId, query });
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!taskId) return undefined;

    const url = `${API_BASE_URL}${backtestUrls.taskEventsById(taskId)}`;
    const eventSource = new EventSource(url);

    const handleRefresh = () => {
      void refetchRef.current();
    };

    eventSource.addEventListener('task-progress', handleRefresh);
    eventSource.addEventListener('task-updated', handleRefresh);

    return () => {
      eventSource.close();
    };
  }, [taskId]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<BacktestTaskResultItem> | SorterResult<BacktestTaskResultItem>[],
  ) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const nextQuery: GetTaskResultsQuery = {
      ...query,
      page: pagination.current ?? 1,
      limit: pagination.pageSize ?? 20,
    };

    if (singleSorter?.columnKey && singleSorter.order) {
      const sortBy = SORT_FIELD_MAP[String(singleSorter.columnKey)];
      if (sortBy) {
        nextQuery.sortBy = sortBy;
        nextQuery.sortOrder = singleSorter.order === 'ascend' ? 'asc' : 'desc';
      }
    }

    setQuery(nextQuery);
  };

  const columns: ColumnsType<BacktestTaskResultItem> = [
    {
      title: '#',
      dataIndex: 'subtaskIndex',
      key: 'subtaskIndex',
      width: 60,
      sorter: true,
      sortOrder:
        query.sortBy === 'subtask_index'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
    },
    {
      title: t('backtest.detail.results.strategyName'),
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 160,
      ellipsis: true,
      render: (value?: string) => value ?? '—',
    },
    {
      title: t('backtest.detail.results.strategyType'),
      dataIndex: 'strategyType',
      key: 'strategyType',
      width: 120,
      render: (value: string) => (
        <Tag color={value === 'trend_following' ? 'blue' : 'purple'}>
          {t(`backtest.detail.results.strategyTypes.${value}`, value)}
        </Tag>
      ),
    },
    {
      title: t('backtest.detail.pair'),
      dataIndex: 'pair',
      key: 'pair',
      width: 110,
    },
    {
      title: t('backtest.detail.timeframe'),
      dataIndex: 'timeframe',
      key: 'timeframe',
      width: 80,
    },
    {
      title: t('backtest.detail.results.slTp'),
      key: 'slTp',
      width: 90,
      render: (_, row) =>
        row.stopLossPct != null && row.takeProfitPct != null
          ? `${row.stopLossPct}/${row.takeProfitPct}%`
          : '—',
    },
    {
      title: t('backtest.detail.results.roi'),
      key: 'roiPct',
      width: 90,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'roi_pct'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) =>
        row.summary ? (
          <Typography.Text type={row.summary.roiPct >= 0 ? 'success' : 'danger'}>
            {row.summary.roiPct.toFixed(2)}%
          </Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('backtest.detail.netResult'),
      key: 'netProfit',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'net_profit'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) =>
        row.summary ? (
          <Typography.Text type={row.summary.netProfit >= 0 ? 'success' : 'danger'}>
            {row.summary.netProfit.toFixed(2)}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('backtest.detail.winRate'),
      key: 'winRatePct',
      width: 90,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'win_rate_pct'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) =>
        row.summary ? `${row.summary.winRatePct.toFixed(1)}%` : '—',
    },
    {
      title: t('backtest.detail.totalOrders'),
      key: 'totalTrades',
      width: 80,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'total_trades'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) => row.summary?.totalTrades ?? '—',
    },
    {
      title: t('backtest.detail.results.tradesPerMonth'),
      key: 'tradesPerMonth',
      width: 90,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'trades_per_month'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) =>
        row.summary?.tradesPerMonth != null
          ? row.summary.tradesPerMonth.toFixed(1)
          : '—',
    },
    {
      title: t('backtest.detail.winningOrders'),
      key: 'winningTrades',
      width: 90,
      align: 'right',
      render: (_, row) =>
        row.summary?.winningTrades != null ? (
          <Typography.Text type="success">{row.summary.winningTrades}</Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('backtest.detail.losingOrders'),
      key: 'losingTrades',
      width: 90,
      align: 'right',
      render: (_, row) =>
        row.summary?.losingTrades != null ? (
          <Typography.Text type="danger">{row.summary.losingTrades}</Typography.Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('backtest.detail.results.sharpe'),
      key: 'sharpeRatio',
      width: 80,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'sharpe_ratio'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) => row.summary?.sharpeRatio.toFixed(2) ?? '—',
    },
    {
      title: t('backtest.detail.results.maxDrawdown'),
      key: 'maxDrawdownPct',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder:
        query.sortBy === 'max_drawdown_pct'
          ? query.sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (_, row) =>
        row.summary ? `${row.summary.maxDrawdownPct.toFixed(2)}%` : '—',
    },
    {
      title: t('backtest.detail.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, row) =>
        row.status === 'completed' && (row.summary?.totalTrades ?? 0) > 0 ? (
          <Button type="link" size="small" onClick={() => onViewTrades(row)}>
            {t('backtest.detail.viewOrders')}
          </Button>
        ) : row.status === 'failed' ? (
          <Typography.Text type="danger" ellipsis={{ tooltip: row.error }}>
            {row.error ?? t('backtest.detail.results.failed')}
          </Typography.Text>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="results-tab">
      <div className="results-tab__toolbar">
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t('backtest.detail.resultsSection')}
        </Typography.Title>
        <Space>
          {isRunning && <Tag color="processing">{t('backtest.detail.logs.live')}</Tag>}
        </Space>
      </div>

      <ResultsFilters
        taskId={taskId}
        query={query}
        onChange={setQuery}
        onReset={() => setQuery(DEFAULT_QUERY)}
      />

      <Table<BacktestTaskResultItem>
        rowKey="id"
        size="small"
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data?.items ?? []}
        scroll={{ x: 'max-content' }}
        onChange={handleTableChange}
        pagination={{
          current: data?.page ?? query.page,
          pageSize: data?.limit ?? query.limit,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => t('backtest.detail.results.total', { total }),
        }}
      />
    </div>
  );
};

export default ResultsTab;
