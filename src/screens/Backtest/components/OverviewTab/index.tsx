import { useTranslation } from 'react-i18next';
import { Alert, Descriptions, Space } from 'antd';
import { format } from 'date-fns';
import type { FC } from 'react';
import type { BacktestErrorItem, BacktestRunDetailRun } from '../types';
import './OverviewTab.css';

export interface OverviewTabProps {
  run: BacktestRunDetailRun;
  resultsCount: number;
  errors: BacktestErrorItem[];
}

const OverviewTab: FC<OverviewTabProps> = ({ run, resultsCount, errors }) => {
  const { t } = useTranslation();

  return (
    <div className="overview-tab">
      <Descriptions
        bordered
        size="small"
        column={1}
        className="overview-tab__meta"
      >
        <Descriptions.Item label={t('backtest.columns.id')}>
          {run.id}
        </Descriptions.Item>
        <Descriptions.Item label={t('backtest.columns.createdAt')}>
          {run.createdAt
            ? format(new Date(run.createdAt), 'dd/MM/yyyy HH:mm:ss')
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={t('backtest.columns.updatedAt')}>
          {run.updatedAt
            ? format(new Date(run.updatedAt), 'dd/MM/yyyy HH:mm:ss')
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={t('backtest.detail.metricsTotalResults')}>
          {resultsCount}
        </Descriptions.Item>
        <Descriptions.Item label={t('backtest.detail.metricsTotalErrors')}>
          {errors.length}
        </Descriptions.Item>
      </Descriptions>

      {errors.length > 0 && (
        <>
          <h3 className="overview-tab__errors-title">
            {t('backtest.detail.errorsSection')} ({errors.length})
          </h3>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {errors.map((err, i) => (
              <Alert
                key={i}
                type="error"
                showIcon
                message={err.name ?? 'Error'}
                description={err.error}
              />
            ))}
          </Space>
        </>
      )}
    </div>
  );
};

export default OverviewTab;
