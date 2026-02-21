import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'antd';
import { useCallback, useState, type FC } from 'react';
import type { ResultSummary } from '../types';
import ResultSummariesTable from '../ResultSummariesTable';
import SelectStrategiesModal from '../SelectStrategiesModal';

export interface StrategiesTabProps {
  results: ResultSummary[];
  loading?: boolean;
}

const StrategiesTab: FC<StrategiesTabProps> = ({ results, loading = false }) => {
  const { t } = useTranslation();
  const [selectStrategiesModalOpen, setSelectStrategiesModalOpen] = useState<boolean>(false);


  const onOpenSelectStrategies = useCallback(() => {
    setSelectStrategiesModalOpen(true);
  }, []);

  return (
    <div className="strategies-tab">
      <div>
        <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
          {t('backtest.detail.tabs.strategies')} ({results.length})
        </Typography.Title>
        <Button type="primary" onClick={onOpenSelectStrategies}>
          {t('backtest.detail.tabs.strategies.add')}
        </Button>
      </div>
      <ResultSummariesTable
        dataSource={results}
        loading={loading}
      />

      <SelectStrategiesModal
        open={selectStrategiesModalOpen}
        onClose={() => setSelectStrategiesModalOpen(false)}
        onConfirm={(selectedIds) => {
          // TODO: add selectedIds to backtest task via API
          void selectedIds;
        }}
      />
    </div>
  );
};

export default StrategiesTab;
