import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Tabs, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import {
  OrdersModal,
  ConfigTab,
  LogsTab,
  ResultsTab,
} from './components';
import {
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useRunTaskMutation,
  type BacktestTask,
  type BacktestTaskResultItem,
  type UpdateBacktestTaskRequest,
} from '../../modules/backtest';
import {
  buildBacktestTaskConfigUpdateRequest,
  isBacktestTaskConfigDirty,
  normalizeBacktestTask,
} from './components/ConfigTab/configTab.utils';

const BacktestRunDetailPage: FC = () => {
  const { t } = useTranslation();
  const { runId } = useParams<{ runId: string }>();
  const { data: task, isLoading, isError, error, refetch } = useGetTaskByIdQuery(runId!, {
    skip: !runId,
      refetchOnFocus: true,
    });


  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [runTask, { isLoading: isRunningTask }] = useRunTaskMutation();
  const [selectedResult, setSelectedResult] = useState<BacktestTaskResultItem | null>(null);
  
  const navigate = useNavigate();


  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const [currentTask, setCurrentTask] = useState<BacktestTask | null>(null);



  const onUpdateBacktestTask = useCallback((payload: UpdateBacktestTaskRequest) => {
  }, [runId, updateTask]);

  const errorMessage =
    isError && error && 'message' in error ? String(error.message) : null;

  useEffect(() => {
    if (task) {
      setCurrentTask(normalizeBacktestTask(task));
    }
  }, [task?.id]);

  const isConfigDirty = useMemo(() => {
    if (!task || !currentTask) return false;
    return isBacktestTaskConfigDirty(normalizeBacktestTask(task), currentTask);
  }, [task, currentTask]);

  const handleSaveConfig = useCallback(async () => {
    if (!runId || !currentTask || !isConfigDirty) return;

    try {
      const updatedTask = await updateTask({
        taskId: runId,
        body: buildBacktestTaskConfigUpdateRequest(currentTask),
      }).unwrap();
      setCurrentTask(updatedTask);
      message.success(t('backtest.config.summary.taskUpdated'));
    } catch {
      message.error(t('backtest.config.summary.taskUpdateError'));
    }
  }, [currentTask, isConfigDirty, runId, t, updateTask]);

  const handleRunTask = useCallback(async () => {
    if (!runId || isConfigDirty) return;

    try {
      await runTask(runId).unwrap();
      message.success(t('backtest.config.summary.taskRunStarted'));
    } catch {
      message.error(t('backtest.config.summary.taskRunError'));
    }
  }, [isConfigDirty, runId, runTask, t]);

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
          {currentTask ?  (
            <Tabs
              defaultActiveKey="overview"
              items={[
                // {
                //   key: 'overview',
                //   label: t('backtest.detail.tabs.overview'),
                //   children: (
                //     // <OverviewTab
                //     //   run={runForOverview}
                //     //   resultsCount={resultsCount}
                //     //   errors={errorsFromTask}
                //     // />
                //     <></>
                //   ),
                // },
                // {
                //   key: 'futuresPairs',
                //   label: t('backtest.detail.tabs.futuresPairs'),
                //   children: (
                //     <FuturesPairsTab
                //       selectedPairs={backtestTask?.selectedPairs ?? []}
                //       loading={isLoading}
                //       onUpdateBacktestTask={onUpdateBacktestTask}
                //     />
                //   ),
                // },
                // {
                //   key: 'strategies',
                //   label: t('backtest.detail.tabs.strategies'),
                //   children: (
                //     <StrategiesTab
                //       loading={isLoading}
                //       backtestTask={backtestTask}
                //       onUpdateBacktestTask={onUpdateBacktestTask}
                //     />
                //   ),
                // },
                // {
                //   key: 'results',
                //   label: t('backtest.detail.tabs.results'),
                //   children: (
                //     <ResultsTab
                //       loading={isLoading}
                //       onViewOrders={setOrdersModalResultIndex}
                //     />
                //   ),
                // },
                {
                  key: 'results',
                  label: t('backtest.detail.tabs.results'),
                  children: (
                    <ResultsTab
                      taskId={runId}
                      isRunning={currentTask.status === 'running'}
                      onViewTrades={setSelectedResult}
                    />
                  ),
                },
                {
                  key: 'logs',
                  label: t('backtest.detail.tabs.logs'),
                  children: (
                    <LogsTab
                      taskId={runId}
                      isRunning={currentTask.status === 'running'}
                    />
                  ),
                },
                {
                  key: 'config',
                  label: t('backtest.detail.tabs.config'),
                  children: (
                    <ConfigTab
                      backtestTask={currentTask}
                      onChangeBacktestTask={setCurrentTask}
                      loading={isLoading}
                      isDirty={isConfigDirty}
                      isSaving={isUpdatingTask}
                      isRunning={isRunningTask}
                      onSave={handleSaveConfig}
                      onRun={handleRunTask}
                    />
                  ),
                },
              ]}
            />
          ) : null}
        </div>
      </AppContainer>


      <OrdersModal
        open={selectedResult !== null}
        taskId={runId}
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </>
  );
};

export default BacktestRunDetailPage;
