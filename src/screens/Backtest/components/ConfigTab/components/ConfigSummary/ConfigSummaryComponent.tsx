import { Button, Typography } from 'antd';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { BacktestTaskStatus, type BacktestTask } from '../../../../../../modules/backtest';
import '../../ConfigTabPanel.css';
import {
  countBacktestSimulations,
  countStepGridValues,
  countStopLossTakeProfitCombinations,
  countStrategyConfigVariants,
} from './configSummary.utils';
import './ConfigSummary.css';

export interface ConfigSummaryProps {
  backtestTask: BacktestTask;
  loading?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  isRunning?: boolean;
  onSave?: () => void;
  onRun?: () => void;
}

const ConfigSummary: FC<ConfigSummaryProps> = ({
  backtestTask,
  loading = false,
  isDirty = false,
  isSaving = false,
  isRunning = false,
  onSave,
  onRun,
}) => {
  const { t } = useTranslation();

  const assetsCount = backtestTask.selectedPairs.length;
  const timeframesCount = backtestTask.selectedTimeframes.length;
  const strategyConfigCount = useMemo(
    () => countStrategyConfigVariants(backtestTask),
    [backtestTask]
  );

  const { stopLoss, takeProfit, stopLossTakeProfitStep } = backtestTask.stopLossTakeProfit;

  const stopLossSteps = useMemo(
    () => countStepGridValues(stopLoss, stopLossTakeProfitStep),
    [stopLoss, stopLossTakeProfitStep]
  );

  const takeProfitSteps = useMemo(
    () => countStepGridValues(takeProfit, stopLossTakeProfitStep),
    [takeProfit, stopLossTakeProfitStep]
  );

  const slTpCombinations = useMemo(
    () => countStopLossTakeProfitCombinations(backtestTask.stopLossTakeProfit),
    [backtestTask.stopLossTakeProfit]
  );

  const totalSimulations = useMemo(
    () => countBacktestSimulations(backtestTask),
    [backtestTask]
  );

  const isTaskRunning = backtestTask.status === BacktestTaskStatus.RUNNING;
  const canRun = totalSimulations > 0 && !loading && !isDirty && !isSaving && !isRunning && !isTaskRunning;
  const canSave = isDirty && !loading && !isSaving && !isRunning;

  return (
    <section className="config-tab-panel" aria-labelledby="config-tab-summary-title">
      <h2 id="config-tab-summary-title" className="config-tab-panel__title">
        {t('backtest.config.summary.title')}
      </h2>
      <div className="config-tab-panel__body config-summary">
        <div className="config-summary__block">
          <Typography.Text className="config-summary__label">
            {t('backtest.config.summary.currentlySelected')}
          </Typography.Text>
          <Typography.Paragraph className="config-summary__value">
            {t('backtest.config.summary.selectedStats', {
              assets: assetsCount,
              timeframes: timeframesCount,
              strategyConfigs: strategyConfigCount,
              slTpCombinations,
            })}
          </Typography.Paragraph>
        </div>

        <div className="config-summary__block">
          <Typography.Text className="config-summary__label">
            {t('backtest.config.summary.totalCombinations')}
          </Typography.Text>
          <Typography.Paragraph className="config-summary__formula">
            {t('backtest.config.summary.combinationFormula', {
              assets: assetsCount,
              timeframes: timeframesCount,
              strategyConfigs: strategyConfigCount,
              stopLossSteps,
              takeProfitSteps,
              slTpCombinations,
              total: totalSimulations,
            })}
          </Typography.Paragraph>
        </div>

        <div className="config-summary__actions">
          <Button
            type="default"
            size="large"
            block
            disabled={!canSave}
            loading={isSaving}
            onClick={onSave}
          >
            {t('backtest.config.summary.updateTask')}
          </Button>
        </div>

        <div className="config-summary__run">
          <Button
            type="primary"
            size="large"
            block
            disabled={!canRun}
            loading={isRunning}
            onClick={onRun}
          >
            {t('backtest.config.summary.runBacktest', { count: totalSimulations })}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConfigSummary;
