import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import {
  FuturesPairsTab,
  StrategiesTab,
  ResultsTab,
  OrdersModal,
} from './components';
import type { PairTimeframeCount, ResultSummary } from './components';
import { useGetTaskByIdQuery, useUpdateTaskMutation, type BacktestTask, type UpdateBacktestTaskRequest } from '../../modules/backtest';

const BacktestRunDetailPage: FC = () => {
  const { t } = useTranslation();
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [ordersModalResultIndex, setOrdersModalResultIndex] = useState<number | null>(null);

  const { data: task, isLoading, isError, error } = useGetTaskByIdQuery(runId!, {
    skip: !runId,
  });

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();


  const backtestTask = useMemo(() => {
    return task;
  }, [task])



  const onUpdateBacktestTask = useCallback((backtestTask: UpdateBacktestTaskRequest) => {
    console.log("backtestTask", backtestTask)
    updateTask({ taskId: runId!, body: {
      name: backtestTask.name,
      selectedTrendFollowingStrategies: backtestTask.selectedTrendFollowingStrategies ?? [],
      selectedBreakoutStrategies: backtestTask.selectedBreakoutStrategies ?? [],
      stopLoss: backtestTask.stopLoss,
      takeProfit: backtestTask.takeProfit,
      stopLossTakeProfitStep: backtestTask.stopLossTakeProfitStep,
    } });
  }, []);



  const errorMessage =
    isError && error && 'message' in error ? String(error.message) : null;

  const runForOverview = useMemo(() => {
    if (!task) return null;
    return {
      id: task.id,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }, [task]);

  const pairTimeframeCounts = useMemo<PairTimeframeCount[]>(() => {
    if (!task?.selectedPairs?.length) return [];
    const map = new Map<string, PairTimeframeCount>();
    for (const item of task.selectedPairs) {
      const metaId = typeof item.meta === 'string' ? item.meta : (item.meta as { id?: string; _id?: string })?.id ?? (item.meta as { _id?: string })?._id ?? '';
      const pair = metaId || '—';
      const timeframe = '—';
      const key = `${pair}|${timeframe}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { pair, timeframe, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [task?.selectedPairs]);

  // const resultsFromTask: ResultSummary[] = useMemo(() => {
  //   const trendIds = task?.selectedTrendFollowingStrategies ?? [];
  //   const breakoutIds = task?.selectedBreakoutStrategies ?? [];
  //   const allIds = [...trendIds, ...breakoutIds];
  //   if (!allIds.length) return [];
  //   return allIds.map((strategyId) => ({
  //     params: {
  //       name: strategyId,
  //       pair: '—',
  //       timeframe: '—',
  //     },
  //     total_orders: 0,
  //     winning_orders: 0,
  //     losing_orders: 0,
  //     net_result: 0,
  //     win_rate: 0,
  //   }));
  // }, [task?.selectedTrendFollowingStrategies, task?.selectedBreakoutStrategies]);



  if (!runId) {
    return null;
  }

  if (!task && !isLoading) {
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
            <Alert
              type="info"
              message={t('backtest.detail.notAvailable')}
              showIcon
              className="backtest-detail-page__info"
            />
          </div>
        </AppContainer>
      </>
    );
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
            {t('backtest.detail.title')} {task?.name ?? runId}
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
          {runForOverview && (
            <Tabs
              defaultActiveKey="overview"
              items={[
                {
                  key: 'overview',
                  label: t('backtest.detail.tabs.overview'),
                  children: (
                    // <OverviewTab
                    //   run={runForOverview}
                    //   resultsCount={resultsCount}
                    //   errors={errorsFromTask}
                    // />
                    <></>
                  ),
                },
                {
                  key: 'futuresPairs',
                  label: t('backtest.detail.tabs.futuresPairs'),
                  children: (
                    <FuturesPairsTab
                      dataSource={pairTimeframeCounts}
                      loading={isLoading}
                    />
                  ),
                },
                {
                  key: 'strategies',
                  label: t('backtest.detail.tabs.strategies'),
                  children: (
                    <StrategiesTab
                      loading={isLoading}
                      backtestTask={backtestTask}
                      onUpdateBacktestTask={onUpdateBacktestTask}
                    />
                  ),
                },
                {
                  key: 'results',
                  label: t('backtest.detail.tabs.results'),
                  children: (
                    <ResultsTab
                      loading={isLoading}
                      onViewOrders={setOrdersModalResultIndex}
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      </AppContainer>


      <OrdersModal
        open={ordersModalResultIndex !== null}
        resultIndex={ordersModalResultIndex}
        orders={[]}
        loading={false}
        onClose={() => setOrdersModalResultIndex(null)}
      />
    </>
  );
};

export default BacktestRunDetailPage;
