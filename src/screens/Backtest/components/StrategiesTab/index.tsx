import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'antd';
import type { FC } from 'react';
import type { ResultSummary } from '../types';
import ResultSummariesTable from '../ResultSummariesTable';

export interface StrategiesTabProps {
  results: ResultSummary[];
  loading?: boolean;
}

const StrategiesTab: FC<StrategiesTabProps> = ({ results, loading = false }) => {
  const { t } = useTranslation();

  return (
    <div className="strategies-tab">
      <div>
        <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          {t('backtest.detail.tabs.strategies')} ({results.length})
        </Typography.Title>
        <Button type="primary" onClick={() => {}}>
          {t('backtest.detail.tabs.strategies.add')}
        </Button>
      </div>
      <ResultSummariesTable
        dataSource={results}
        loading={loading}
      />
    </div>
  );
};

export default StrategiesTab;
