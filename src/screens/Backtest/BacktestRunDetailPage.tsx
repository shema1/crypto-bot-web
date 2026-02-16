import { useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import {
  OverviewTab,
  FuturesPairsTab,
  StrategiesTab,
  ResultsTab,
  OrdersModal,
} from './components';
import type { BacktestErrorItem, PairTimeframeCount, ResultSummary } from './components';
import { useGetRunByIdQuery, useGetOrdersForResultQuery } from '../../modules/backtest';

const BacktestRunDetailPage: FC = () => {
  const { t } = useTranslation();
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [ordersModalResultIndex, setOrdersModalResultIndex] = useState<number | null>(null);

  const { data: run, isLoading, isError, error } = useGetRunByIdQuery(runId!, {
    skip: !runId,
  });
  const { data: orders, isLoading: ordersLoading } = useGetOrdersForResultQuery(
    { runId: runId!, resultIndex: ordersModalResultIndex! },
    { skip: !runId || ordersModalResultIndex === null }
  );

  const errorMessage =
    isError && error && 'message' in error ? String(error.message) : null;
  const results = (run?.results ?? []) as ResultSummary[];
  const errors = (run?.errors ?? []) as BacktestErrorItem[];

  const pairTimeframeCounts = useMemo<PairTimeframeCount[]>(() => {
    const map = new Map<string, PairTimeframeCount>();
    for (const r of results) {
      const pair = r.params?.pair ?? '—';
      const tf = r.params?.timeframe ?? '—';
      const key = `${pair}|${tf}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { pair, timeframe: tf, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [results]);

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
            <Tabs
              defaultActiveKey="overview"
              items={[
                {
                  key: 'overview',
                  label: t('backtest.detail.tabs.overview'),
                  children: (
                    <OverviewTab
                      run={run}
                      resultsCount={results.length}
                      errors={errors}
                    />
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
                    <StrategiesTab results={results} loading={isLoading} />
                  ),
                },
                {
                  key: 'results',
                  label: t('backtest.detail.tabs.results'),
                  children: (
                    <ResultsTab
                      results={results}
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
        orders={(orders ?? []) as Record<string, unknown>[]}
        loading={ordersLoading}
        onClose={() => setOrdersModalResultIndex(null)}
      />
    </>
  );
};

export default BacktestRunDetailPage;
