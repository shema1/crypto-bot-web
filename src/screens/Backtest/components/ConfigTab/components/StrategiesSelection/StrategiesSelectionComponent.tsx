import { Button, Collapse, type CollapseProps } from 'antd';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestTask } from '../../../../../../modules/backtest';
import {
  getBreakoutMinBars,
  getTrendFollowingMinBars,
} from '../../../../../../modules/backtest/utils/strategyCandles.utils';
import StrategyCandleRequirementsPopover from '../../../StrategyCandleRequirements/StrategyCandleRequirementsPopover';
import { BreakoutStrategiesList, TrendFollowingStrategiesList } from './components';
import { useBreakoutBulkActions, useTrendFollowingBulkActions } from './useStrategyBulkActions';
import '../../ConfigTabPanel.css';
import './StrategiesSelection.css';

interface StrategiesSelectionProps {
  backtestTask: BacktestTask;
  onChangeBacktestTask: (backtestTask: BacktestTask) => void;
  loading?: boolean;
}

const StrategiesSelection: FC<StrategiesSelectionProps> = ({
  backtestTask,
  onChangeBacktestTask,
  loading = false,
}) => {
  const { t } = useTranslation();

  const trendFollowingBulk = useTrendFollowingBulkActions({
    backtestTask,
    onChangeBacktestTask,
    disabled: loading,
  });

  const breakoutBulk = useBreakoutBulkActions({
    backtestTask,
    onChangeBacktestTask,
    disabled: loading,
  });

  const accordionItems = useMemo<CollapseProps['items']>(
    () => [
      {
        key: 'trendFollowing',
        label: (
          <span className="strategies-selection__accordion-label">
            {t('nav.trendFollowing')}
            <StrategyCandleRequirementsPopover
              minBars={getTrendFollowingMinBars({})}
              categoryLabel={t('nav.trendFollowing')}
              ariaLabel={t('backtest.config.strategyManager.candleRequirements.trendFollowing')}
            />
          </span>
        ),
        extra: (
          <Button
            type="link"
            size="small"
            className="strategies-selection__bulk-action"
            loading={trendFollowingBulk.isBulkLoading}
            disabled={trendFollowingBulk.isBulkDisabled}
            onClick={trendFollowingBulk.onBulkAction}
          >
            {trendFollowingBulk.isAllSelected
              ? t('backtest.config.strategyManager.removeAll')
              : t('backtest.config.strategyManager.addAll')}
          </Button>
        ),
        children: (
          <TrendFollowingStrategiesList
            backtestTask={backtestTask}
            onChangeBacktestTask={onChangeBacktestTask}
            disabled={loading}
          />
        ),
      },
      {
        key: 'breakout',
        label: (
          <span className="strategies-selection__accordion-label">
            {t('nav.breakout')}
            <StrategyCandleRequirementsPopover
              minBars={getBreakoutMinBars({})}
              categoryLabel={t('nav.breakout')}
              ariaLabel={t('backtest.config.strategyManager.candleRequirements.breakout')}
            />
          </span>
        ),
        extra: (
          <Button
            type="link"
            size="small"
            className="strategies-selection__bulk-action"
            loading={breakoutBulk.isBulkLoading}
            disabled={breakoutBulk.isBulkDisabled}
            onClick={breakoutBulk.onBulkAction}
          >
            {breakoutBulk.isAllSelected
              ? t('backtest.config.strategyManager.removeAll')
              : t('backtest.config.strategyManager.addAll')}
          </Button>
        ),
        children: (
          <BreakoutStrategiesList
            backtestTask={backtestTask}
            onChangeBacktestTask={onChangeBacktestTask}
            disabled={loading}
          />
        ),
      },
    ],
    [
      backtestTask,
      breakoutBulk.isAllSelected,
      breakoutBulk.isBulkDisabled,
      breakoutBulk.isBulkLoading,
      breakoutBulk.onBulkAction,
      loading,
      onChangeBacktestTask,
      t,
      trendFollowingBulk.isAllSelected,
      trendFollowingBulk.isBulkDisabled,
      trendFollowingBulk.isBulkLoading,
      trendFollowingBulk.onBulkAction,
    ]
  );

  return (
    <section className="config-tab-panel" aria-labelledby="config-tab-strategy-manager-title">
      <h2 id="config-tab-strategy-manager-title" className="config-tab-panel__title">
        {t('backtest.config.strategyManager.title')}
      </h2>
      <div className="config-tab-panel__body strategies-selection">
        <Collapse className="strategies-selection__accordion" items={accordionItems} />
      </div>
    </section>
  );
};

export default StrategiesSelection;
