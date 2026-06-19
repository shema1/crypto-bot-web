import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
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
  BacktestRunPhase,
  useGetTaskOverviewQuery,
  useBacktestTaskLiveEvents,
  formatRunDuration,
  computeRunDurationSeconds,
  estimateSubtasksRemainingSeconds,
  type BacktestTask,
  type BacktestTaskOverviewTopResult,
  type BacktestTaskResultItem,
} from '../../../../modules/backtest';
import { countBacktestSimulations } from '../ConfigTab/components/ConfigSummary/configSummary.utils';
import PhaseDurationTimer from './PhaseDurationTimer';
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
  const { data: overview, isLoading, refetch } = useGetTaskOverviewQuery(taskId, {
    pollingInterval: task.status === BacktestTaskStatus.RUNNING ? 1000 : 0,
  });
  const [localPrepStartedAt, setLocalPrepStartedAt] = useState<string | undefined>();
  const [localSubtasksStartedAt, setLocalSubtasksStartedAt] = useState<string | undefined>();

  useEffect(() => {
    if (isRunningMutation) {
      setLocalPrepStartedAt(new Date().toISOString());
    }
  }, [isRunningMutation]);

  useEffect(() => {
    if (task.status !== BacktestTaskStatus.RUNNING) {
      setLocalPrepStartedAt(undefined);
      setLocalSubtasksStartedAt(undefined);
    }
  }, [task.status]);

  const handleLiveRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  useBacktestTaskLiveEvents(taskId, handleLiveRefresh);

  const status = task.status;
  const runPhase = overview?.runPhase ?? BacktestRunPhase.IDLE;
  const preparation = overview?.preparation;
  const subtasks = overview?.subtasks;
  const isPreparingData = preparation?.isActive ?? runPhase === BacktestRunPhase.PREPARING_DATA;
  const isRunningSubtasks = subtasks?.isActive ?? runPhase === BacktestRunPhase.RUNNING_SUBTASKS;
  /** Task status from parent is the source of truth (refetched on SSE). */
  const isRunActive = status === BacktestTaskStatus.RUNNING;
  const totalSimulations = useMemo(() => countBacktestSimulations(task), [task]);
  const canRun =
    totalSimulations > 0 &&
    !isConfigDirty &&
    !isSaving &&
    !isRunningMutation &&
    !isRunActive;
  const canStop = isRunActive && !isStoppingMutation;

  const progress = overview?.progress;
  const stats = overview?.stats;
  const configSummary = overview?.task?.configSummary;
  const executionSettings = overview?.task?.executionSettings ?? task.executionSettings;
  const runStartedAt =
    overview?.timing?.runStartedAt
    ?? overview?.task?.runStartedAt
    ?? task.runStartedAt;
  const runFinishedAt =
    overview?.timing?.runFinishedAt
    ?? overview?.task?.runFinishedAt
    ?? task.runFinishedAt;

  useEffect(() => {
    if (isRunningSubtasks && !subtasks?.startedAt) {
      setLocalSubtasksStartedAt((prev) => prev ?? new Date().toISOString());
    }
  }, [isRunningSubtasks, subtasks?.startedAt]);

  useEffect(() => {
    if (preparation?.startedAt && localPrepStartedAt) {
      setLocalPrepStartedAt(undefined);
    }
  }, [preparation?.startedAt, localPrepStartedAt]);

  useEffect(() => {
    if (subtasks?.startedAt && localSubtasksStartedAt) {
      setLocalSubtasksStartedAt(undefined);
    }
  }, [subtasks?.startedAt, localSubtasksStartedAt]);

  const prepStartedAt = preparation?.startedAt ?? localPrepStartedAt;
  const subtasksStartedAt = subtasks?.startedAt ?? localSubtasksStartedAt;
  const showPrepSection =
    isPreparingData
    || Boolean(prepStartedAt)
    || ((preparation?.totalSymbols ?? 0) > 0 && isRunActive);
  const backtestProgress = subtasks ?? progress;
  const showSubtasksSection =
    isRunningSubtasks
    || Boolean(subtasksStartedAt)
    || (backtestProgress?.total ?? 0) > 0;

  const finishedDurationSeconds =
    overview?.timing?.durationSeconds
    ?? computeRunDurationSeconds(runStartedAt, runFinishedAt);

  const subtasksProcessed = backtestProgress
    ? backtestProgress.completed + backtestProgress.failed
    : 0;
  const subtasksTotal = backtestProgress?.total ?? 0;

  /** Recalculated when a subtask completes or fails (not on every elapsed second). */
  const subtasksRemainingEstimate = useMemo(() => {
    if (!isRunningSubtasks || !subtasksStartedAt || subtasksTotal === 0) {
      return null;
    }

    const remaining = subtasksTotal - subtasksProcessed;
    const elapsedSeconds = computeRunDurationSeconds(
      subtasksStartedAt,
      new Date().toISOString(),
    );

    return estimateSubtasksRemainingSeconds({
      processed: subtasksProcessed,
      remaining,
      elapsedSeconds,
    });
  }, [isRunningSubtasks, subtasksStartedAt, subtasksProcessed, subtasksTotal]);

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
          {isRunActive && (
            <Badge status="processing" text={t('backtest.detail.overview.live')} />
          )}
        </Space>
        <Space wrap>
          {isRunActive ? (
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

      {showPrepSection && (
        <section className="overview-tab__section">
          <div className="overview-tab__section-header">
            <Typography.Title level={5} className="overview-tab__section-title">
              {t('backtest.detail.overview.preparationProgress')}
            </Typography.Title>
            <PhaseDurationTimer
              startedAt={prepStartedAt}
              finishedAt={preparation?.finishedAt}
              isActive={isPreparingData}
              durationSeconds={preparation?.durationSeconds}
              formatRunningLabel={(duration) =>
                t('backtest.detail.overview.phaseDurationRunning', { duration })
              }
              formatFinishedLabel={(duration) =>
                t('backtest.detail.overview.phaseDurationFinished', { duration })
              }
            />
          </div>
          <Progress
            percent={preparation?.percent ?? 0}
            status={isPreparingData ? 'active' : 'success'}
            format={() =>
              t('backtest.detail.overview.preparationFormat', {
                completed: preparation?.completedSymbols ?? 0,
                total: preparation?.totalSymbols ?? 0,
              })
            }
          />
          {preparation?.currentSymbol && isPreparingData && (
            <div className="overview-tab__progress-meta">
              <Typography.Text type="secondary">
                {t('backtest.detail.overview.preparationCurrentSymbol', {
                  symbol: preparation.currentSymbol,
                })}
              </Typography.Text>
            </div>
          )}
        </section>
      )}

      {showSubtasksSection && backtestProgress && (
        <section className="overview-tab__section">
          <div className="overview-tab__section-header">
            <Typography.Title level={5} className="overview-tab__section-title">
              {t('backtest.detail.overview.backtestProgress')}
            </Typography.Title>
            <PhaseDurationTimer
              startedAt={subtasksStartedAt}
              finishedAt={subtasks?.finishedAt}
              isActive={isRunningSubtasks}
              durationSeconds={subtasks?.durationSeconds}
              formatRunningLabel={(duration) =>
                t('backtest.detail.overview.phaseDurationRunning', { duration })
              }
              formatFinishedLabel={(duration) =>
                t('backtest.detail.overview.phaseDurationFinished', { duration })
              }
            />
          </div>
          <Progress
            percent={backtestProgress.percent}
            status={
              isRunningSubtasks
                ? 'active'
                : status === BacktestTaskStatus.FAILED
                  ? 'exception'
                  : status === BacktestTaskStatus.STOPPED
                    ? 'normal'
                    : 'success'
            }
            format={() =>
              t('backtest.detail.overview.progressFormat', {
                completed: backtestProgress.completed,
                failed: backtestProgress.failed,
                total: backtestProgress.total,
              })
            }
          />
          {(backtestProgress.skipped > 0 || subtasksRemainingEstimate != null) && (
            <div className="overview-tab__progress-meta">
              <Space direction="vertical" size={2}>
                {backtestProgress.skipped > 0 && (
                  <Typography.Text type="secondary">
                    {t('backtest.detail.overview.skipped', { count: backtestProgress.skipped })}
                  </Typography.Text>
                )}
                {subtasksRemainingEstimate != null && (
                  <Typography.Text type="secondary">
                    {t('backtest.detail.overview.estimatedRemaining', {
                      duration: formatRunDuration(subtasksRemainingEstimate),
                    })}
                  </Typography.Text>
                )}
              </Space>
            </div>
          )}
        </section>
      )}

      <section className="overview-tab__section">
        <Typography.Title level={5} className="overview-tab__section-title">
          {t('backtest.detail.overview.taskInfo')}
        </Typography.Title>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label={t('backtest.tasks.columns.name')}>
            {overview?.task?.name ?? task.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.config.dataSelection.dateRange.title')}>
            {overview?.task?.dateRange?.startDate ?? task.dateRange.startDate} —{' '}
            {overview?.task?.dateRange?.endDate ?? task.dateRange.endDate}
          </Descriptions.Item>
          <Descriptions.Item label={t('backtest.columns.createdAt')}>
            {overview?.task?.createdAt
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
          {runStartedAt && (
            <Descriptions.Item label={t('backtest.detail.overview.runStartedAt')}>
              {format(new Date(runStartedAt), 'dd/MM/yyyy HH:mm:ss')}
            </Descriptions.Item>
          )}
          {runFinishedAt && !isRunActive && (
            <Descriptions.Item label={t('backtest.detail.overview.runFinishedAt')}>
              {format(new Date(runFinishedAt), 'dd/MM/yyyy HH:mm:ss')}
            </Descriptions.Item>
          )}
          {finishedDurationSeconds != null && !isRunActive && (
            <Descriptions.Item label={t('backtest.detail.overview.durationLabel')}>
              {formatRunDuration(finishedDurationSeconds)}
            </Descriptions.Item>
          )}
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

      {!stats && !isRunActive && (
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

      {(overview?.recentErrors?.length ?? 0) > 0 && (
        <section className="overview-tab__section">
          <Typography.Title level={5} className="overview-tab__section-title">
            {t('backtest.detail.errorsSection')} ({overview?.recentErrors?.length})
          </Typography.Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {overview?.recentErrors?.map((err) => (
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
