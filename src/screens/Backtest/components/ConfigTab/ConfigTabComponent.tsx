import type { FC } from 'react';
import type { BacktestTask } from '../../../../modules/backtest';
import { ConfigSummary, DataSelection, StrategiesSelection } from './components';
import './ConfigTab.css';

export interface ConfigTabProps {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  loading?: boolean;
}

const ConfigTab: FC<ConfigTabProps> = (props) => {
  return (
    <div className="config-tab">
      <DataSelection {...props} />
      <StrategiesSelection {...props} />
      <ConfigSummary {...props} />
    </div>
  );
};

export default ConfigTab;
