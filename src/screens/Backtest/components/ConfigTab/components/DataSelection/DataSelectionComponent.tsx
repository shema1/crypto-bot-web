import { useCallback, type FC } from 'react';
import type { BacktestDateRange, BacktestTask } from '../../../../../../modules/backtest';
import type { BybitTimeframe } from '../../../../../../modules/bybit/types';
import { DateConfig, SymbolConfig, TimeframeConfig } from './components';
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

  return (
    <div className="data-selection">
      <SymbolConfig
        symbols={backtestTask.selectedPairs}
        disabled={loading}
        onChange={handleSymbolsChange}
      />

      <TimeframeConfig
        timeframes={backtestTask.selectedTimeframes}
        disabled={loading}
        onChange={handleTimeframesChange}
      />

      <DateConfig
        dateRange={backtestTask.dateRange}
        disabled={loading}
        onChange={handleDateRangeChange}
      />
    </div>
  );
};

export default DataSelection;
