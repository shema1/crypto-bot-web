import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import {
  OrdersModal,
  ConfigTab
} from './components';
import { useGetTaskByIdQuery, useUpdateTaskMutation, type BacktestTask, type UpdateBacktestTaskRequest } from '../../modules/backtest';



const BacktestRunDetailPage: FC = () => {
  const { t } = useTranslation();
  const { runId } = useParams<{ runId: string }>();
  const { data: task, isLoading, isError, error, refetch } = useGetTaskByIdQuery(runId!, {
    skip: !runId,
      refetchOnFocus: true,
    });


  const [updateTask] = useUpdateTaskMutation();
  const [ordersModalResultIndex, setOrdersModalResultIndex] = useState<number | null>(null);
  
  const navigate = useNavigate();


  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const [currentTask, setCurrentTask] = useState<BacktestTask | null>(null);



  const onUpdateBacktestTask = useCallback((payload: UpdateBacktestTaskRequest) => {
  }, [runId, updateTask]);



  const errorMessage =
    isError && error && 'message' in error ? String(error.message) : null;


  useEffect(() => {
    if (task && !currentTask) {
      setCurrentTask(task);
    }
  }, [task, currentTask]);



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
                  key: 'config',
                  label: t('backtest.detail.tabs.config'),
                  children: (
                    <ConfigTab
                      backtestTask={currentTask}
                      onChangeBacktestTask={setCurrentTask}
                      loading={isLoading}
                    />
                  ),
                },
              ]}
            />
          ) : null}
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
