import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestDateRange, BacktestExecutionSettings, BacktestStopLossTakeProfit, BacktestTask } from '../../../../../../modules/backtest';
import type { BybitTimeframe } from '../../../../../../modules/bybit/types';
import { DateConfig, ExecutionConfig, StopLossTakeProfitConfig, SymbolConfig, TimeframeConfig } from './components';
import '../../ConfigTabPanel.css';
import './DataSelection.css';

export interface DataSelectionProps {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  loading?: boolean;
}

const DataSelection: FC<DataSelectionProps> = ({
  backtestTask,
  onChangeBacktestTask,
  loading = false,
}) => {
  const { t } = useTranslation();
  const handleSymbolsChange = useCallback(
    (symbols: string[]) => {
      onChangeBacktestTask({ ...backtestTask, selectedPairs: symbols });
    },
    [backtestTask, onChangeBacktestTask]
  );

  const handleTimeframesChange = useCallback(
    (timeframes: BybitTimeframe[]) => {
      onChangeBacktestTask({ ...backtestTask, selectedTimeframes: timeframes });
    },
    [backtestTask, onChangeBacktestTask]
  );

  const handleDateRangeChange = useCallback(
    (dateRange: BacktestDateRange) => {
      onChangeBacktestTask({ ...backtestTask, dateRange });
    },
    [backtestTask, onChangeBacktestTask]
  );

  const handleStopLossTakeProfitChange = useCallback(
    (stopLossTakeProfit: BacktestStopLossTakeProfit) => {
      onChangeBacktestTask({ ...backtestTask, stopLossTakeProfit });
    },
    [backtestTask, onChangeBacktestTask]
  );

  const handleExecutionSettingsChange = useCallback(
    (executionSettings: BacktestExecutionSettings) => {
      onChangeBacktestTask({ ...backtestTask, executionSettings });
    },
    [backtestTask, onChangeBacktestTask]
  );

  return (
    <section className="config-tab-panel" aria-labelledby="config-tab-data-selection-title">
      <h2 id="config-tab-data-selection-title" className="config-tab-panel__title">
        {t('backtest.config.dataSelection.title')}
      </h2>
      <div className="config-tab-panel__body data-selection">
        <SymbolConfig
          symbols={backtestTask.selectedPairs}
          disabled={loading}
          onChange={handleSymbolsChange}
        />

        <TimeframeConfig
          timeframes={backtestTask.selectedTimeframes}
          dateRange={backtestTask.dateRange}
          disabled={loading}
          onChange={handleTimeframesChange}
        />
        <StopLossTakeProfitConfig
          stopLossTakeProfit={backtestTask.stopLossTakeProfit}
          disabled={loading}
          onChange={handleStopLossTakeProfitChange}
        />
        <ExecutionConfig
          executionSettings={backtestTask.executionSettings}
          disabled={loading}
          onChange={handleExecutionSettingsChange}
        />
        <DateConfig
          dateRange={backtestTask.dateRange}
          disabled={loading}
          onChange={handleDateRangeChange}
        />
      </div>
    </section>
  );
};

export default DataSelection;
