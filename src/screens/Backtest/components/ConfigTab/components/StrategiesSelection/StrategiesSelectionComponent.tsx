import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestTask } from '../../../../../../modules/backtest';
import '../../ConfigTabPanel.css';

interface StrategiesSelectionProps {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
}

const StrategiesSelection: FC<StrategiesSelectionProps> = () => {
  const { t } = useTranslation();

  return (
    <section className="config-tab-panel" aria-labelledby="config-tab-strategy-manager-title">
      <h2 id="config-tab-strategy-manager-title" className="config-tab-panel__title">
        {t('backtest.config.strategyManager.title')}
      </h2>
      <div className="config-tab-panel__body strategies-selection" />
    </section>
  );
};

export default StrategiesSelection;
