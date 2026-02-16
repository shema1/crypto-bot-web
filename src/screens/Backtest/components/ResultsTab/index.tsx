import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import type { FC } from 'react';
import type { ResultSummary } from '../types';
import ResultSummariesTable from '../ResultSummariesTable';

export interface ResultsTabProps {
  results: ResultSummary[];
  loading?: boolean;
  onViewOrders: (resultIndex: number) => void;
}

const ResultsTab: FC<ResultsTabProps> = ({
  results,
  loading = false,
  onViewOrders,
}) => {
  const { t } = useTranslation();

  return (
    <div className="results-tab">
      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
        {t('backtest.detail.resultsSection')} ({results.length})
      </Typography.Title>
      <ResultSummariesTable
        dataSource={results}
        loading={loading}
        onViewOrders={onViewOrders}
      />
    </div>
  );
};

export default ResultsTab;
