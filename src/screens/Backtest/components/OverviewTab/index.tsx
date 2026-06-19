import { useCallback, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Alert,
  Badge,
  Button,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BacktestTaskStatus,
  useGetTaskOverviewQuery,
  useBacktestTaskLiveEvents,
  type BacktestTask,
  type BacktestTaskOverviewTopResult,
  type BacktestTaskResultItem,
} from '../../../../modules/backtest';
import { countBacktestSimulations } from '../ConfigTab/components/ConfigSummary/configSummary.utils';
import './OverviewTab.css';

export interface OverviewTabProps {
  taskId: string;
  task: BacktestTask;
  isConfigDirty: boolean;
  isSaving: boolean;
  isRunningMutation: boolean;
  isStoppingMutation: boolean;
  onRun: () => void;
  onStop: () => void;
  onViewTrades?: (result: BacktestTaskResultItem) => void;
}

const taskStatusTagColor: Record<string, string> = {
  created: 'default',
  running: 'processing',
  completed: 'success',
  failed: 'error',
  stopped: 'warning',
};

function toResultItem(top: BacktestTaskOverviewTopResult, taskId: string): BacktestTaskResultItem {
  return {
    id: top.id,
    taskId,
    subtaskIndex: top.subtaskIndex,
    strategyType: top.strategyType,
    strategyName: top.strategyName,
    status: top.status,
    pair: top.pair,
    timeframe: top.timeframe,
    stopLossPct: top.stopLossPct,
    takeProfitPct: top.takeProfitPct,
    summary: {
      roiPct: top.roiPct,
      netProfit: top.netProfit,
      winRatePct: top.winRatePct,
      sharpeRatio: top.sharpeRatio,
      totalTrades: top.totalTrades,
      maxDrawdownPct: 0,
      profitFactor: 0,
      initialCash: 0,
      finalValue: 0,
    },
  };
}

const OverviewTab: FC<OverviewTabProps> = ({
  taskId,
  task,
  isConfigDirty,
  isSaving,
  isRunningMutation,
  isStoppingMutation,
  onRun,
  onStop,
  onViewTrades,
}) => {
  const { t } = useTranslation();
  const { data: overview, isLoading, refetch } = useGetTaskOverviewQuery(taskId);

  const handleLiveRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  useBacktestTaskLiveEvents(taskId, handleLiveRefresh);

  const status = overview?.task.status ?? task.status;
  const isTaskRunning = status === BacktestTaskStatus.RUNNING;
  const totalSimulations = useMemo(() => countBacktestSimulations(task), [task]);
  const canRun =
    totalSimulations > 0 &&
    !isConfigDirty &&
    !isSaving &&
    !isRunningMutation &&
    !isTaskRunning;
  const canStop = isTaskRunning && !isStoppingMutation;

  const progress = overview?.progress;
  const stats = overview?.stats;
  const configSummary = overview?.task.configSummary;
  const executionSettings = overview?.task.executionSettings ?? task.executionSettings;

  const topColumns: ColumnsType<BacktestTaskOverviewTopResult> = [
    {
      title: '#',
      dataIndex: 'subtaskIndex',
      key: 'subtaskIndex',
      width: 56,
    },
    {
      title: t('backtest.detail.results.strategyName'),
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 140,
      ellipsis: true,
    },
    {
      title: t('backtest.detail.results.strategyType'),
      dataIndex: 'strategyType',
      key: 'strategyType',
      width: 110,
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
      width: 100,
    },
    {
      title: t('backtest.detail.timeframe'),
      dataIndex: 'timeframe',
      key: 'timeframe',
      width: 72,
    },
    {
      title: t('backtest.detail.results.slTp'),
      key: 'slTp',
      width: 80,
      render: (_, row) =>
        row.stopLossPct != null && row.takeProfitPct != null
          ? `${row.stopLossPct}/${row.takeProfitPct}%`
          : '—',
    },
    {
      title: t('backtest.detail.results.roi'),
      dataIndex: 'roiPct',
      key: 'roiPct',
      width: 88,
      align: 'right',
      render: (value: number) => (
        <Typography.Text type={value >= 0 ? 'success' : 'danger'}>
          {value.toFixed(2)}%
        </Typography.Text>
      ),
    },
    {
      title: t('backtest.detail.netResult'),
      dataIndex: 'netProfit',
      key: 'netProfit',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <Typography.Text type={value >= 0 ? 'success' : 'danger'}>
          {value.toFixed(2)}
        </Typography.Text>
      ),
    },
    {
      title: t('backtest.detail.winRate'),
      dataIndex: 'winRatePct',
      key: 'winRatePct',
      width: 88,
      align: 'right',
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: t('backtest.detail.results.sharpe'),
      dataIndex: 'sharpeRatio',
      key: 'sharpeRatio',
      width: 80,
      align: 'right',
      render: (value: number) => value.toFixed(2),
    },
  ];

  if (onViewTrades) {
    topColumns.push({
      title: t('backtest.detail.actions'),
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          disabled={row.totalTrades === 0}
          onClick={() => onViewTrades(toResultItem(row, taskId))}
        >
          {t('backtest.detail.viewOrders')}
        </Button>
      ),
    });
  }

  return (
    <div className="overview-tab">
      <div className="overview-tab__toolbar">
        <Space wrap>
          <Tag color={taskStatusTagColor[status] ?? 'default'}>
            {t(`backtest.tasks.status.${status}`, status)}
          </Tag>
          {isTaskRunning && (
            <Badge status="processing" text={t('backtest.detail.overview.live')} />
          )}
        </Space>
        <Space wrap>
          {isTaskRunning ? (
            <Button danger loading={isStoppingMutation} disabled={!canStop} onClick={onStop}>
              {t('backtest.detail.overview.stop')}
            </Button>
          ) : (
            <Button
              type="primary"
              loading={isRunningMutation}
              disabled={!canRun}
              onClick={onRun}
            >
              {t('backtest.detail.overview.run')}
            </Button>
          )}
        </Space>
      </div>

      {isConfigDirty && (
        <Alert
          type="warning"
          showIcon
          className="overview-tab__alert"
          message={t('backtest.detail.overview.unsavedConfig')}
        />
      )}

      {isTaskRunning && progress && (
        <section className="overview-tab__section">
          <Typography.Title level={5} className="overview-tab__section-title">
            {t('backtest.detail.overview.progress')}
          </Typography.Title>
          <Progress
            percent={progress.percent}
            status="active"
            format={() =>
              t('backtest.detail.overview.progressFormat', {
                completed: progress.completed,
                failed: progress.failed,
                total: progress.total,
              })
            }
          />
          <div className="overview-tab__progress-meta">
            <Typography.Text type="secondary">
              {t('backtest.detail.overview.skipped', { count: progress.skipped })}
            </Typography.Text>
          </div>
        </section>
      )}

      <section className="overview-tab__section">
        <Typography.Title level={5} className="overview-tab__section-title">
          {t('backtest.detail.overview.taskInfo')}
        </Typography.Title>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label={t('backtest.tasks.columns.name')}>
            {overview?.task.name ?? task.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.config.dataSelection.dateRange.title')}>
            {overview?.task.dateRange.startDate ?? task.dateRange.startDate} —{' '}
            {overview?.task.dateRange.endDate ?? task.dateRange.endDate}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.columns.createdAt')}>
            {overview?.task.createdAt
              ? format(new Date(overview.task.createdAt), 'dd/MM/yyyy HH:mm:ss')
              : task.createdAt
                ? format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm:ss')
                : '—'}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.detail.overview.plannedSubtasks')}>
            {configSummary?.totalPlannedSubtasks ?? totalSimulations}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.detail.overview.pairs')}>
            {configSummary?.pairsCount ?? task.selectedPairs.length}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.detail.overview.timeframes')}>
            {configSummary?.timeframesCount ?? task.selectedTimeframes.length}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.detail.overview.strategies')}>
            {t('backtest.detail.overview.strategiesBreakdown', {
              trend: configSummary?.trendFollowingCount ?? task.selectedTrendFollowingStrategies.length,
              breakout: configSummary?.breakoutCount ?? task.selectedBreakoutStrategies.length,
            })}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.detail.overview.slTpGrid')}>
            {configSummary?.slTpCombinations ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.config.dataSelection.execution.initialCash')}>
            {executionSettings.initialCash}
          </Descriptions.Item>
        </Descriptions>
      </section>

      {stats && (
        <section className="overview-tab__section">
          <Typography.Title level={5} className="overview-tab__section-title">
            {t('backtest.detail.overview.aggregateStats')}
          </Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.overview.completedResults')}
                value={stats.completedResults}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.overview.failedResults')}
                value={stats.failedResults}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.results.roi')}
                value={stats.avgRoiPct ?? 0}
                precision={2}
                suffix="%"
                valueStyle={{ color: (stats.avgRoiPct ?? 0) >= 0 ? '#3f8600' : '#cf1322' }}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.overview.bestRoi')}
                value={stats.bestRoiPct ?? 0}
                precision={2}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.overview.worstRoi')}
                value={stats.worstRoiPct ?? 0}
                precision={2}
                suffix="%"
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.winRate')}
                value={stats.avgWinRatePct ?? 0}
                precision={1}
                suffix="%"
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.results.sharpe')}
                value={stats.avgSharpeRatio ?? 0}
                precision={2}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.totalOrders')}
                value={stats.totalTrades}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.overview.profitableResults')}
                value={stats.profitableResults}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Statistic
                title={t('backtest.detail.overview.unprofitableResults')}
                value={stats.unprofitableResults}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
          </Row>
        </section>
      )}

      {!stats && !isTaskRunning && (
        <Alert
          type="info"
          showIcon
          className="overview-tab__alert"
          message={t('backtest.detail.overview.noStatsYet')}
        />
      )}

      <section className="overview-tab__section">
        <Typography.Title level={5} className="overview-tab__section-title">
          {t('backtest.detail.overview.topStrategies')}
        </Typography.Title>
        <Table<BacktestTaskOverviewTopResult>
          columns={topColumns}
          dataSource={overview?.topResults ?? []}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: t('backtest.detail.overview.noTopResults') }}
        />
      </section>

      {(overview?.recentErrors.length ?? 0) > 0 && (
        <section className="overview-tab__section">
          <Typography.Title level={5} className="overview-tab__section-title">
            {t('backtest.detail.errorsSection')} ({overview?.recentErrors.length})
          </Typography.Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {overview?.recentErrors.map((err) => (
              <Alert
                key={err.id}
                type="error"
                showIcon
                message={`#${err.subtaskIndex} ${err.strategyName} — ${err.pair} ${err.timeframe}`}
                description={err.error}
              />
            ))}
          </Space>
        </section>
      )}
    </div>
  );
};

export default OverviewTab;
