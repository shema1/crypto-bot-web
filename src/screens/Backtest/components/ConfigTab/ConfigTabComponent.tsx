import type { FC } from 'react';
import type { BacktestTask } from '../../../../modules/backtest';
import { DataSelection } from './components';

export interface ConfigTabProps {
  backtestTask: BacktestTask ;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  loading?: boolean;
}

const ConfigTab: FC<ConfigTabProps> = (props) => {
  return <DataSelection {...props} />;
};

export default ConfigTab;
