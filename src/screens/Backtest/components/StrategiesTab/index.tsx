import { useMemo, useCallback, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tabs, Typography } from 'antd';
import { TrendFollowingTable, BreakoutStrategyTable } from '../../../../components/core';
import SelectStrategiesModal from '../SelectStrategiesModal';
import type { BacktestTask, UpdateBacktestTaskRequest } from '../../../../modules/backtest';

export type SelectStrategiesModalOnConfirmParams = {
  selectedTrendFollowingStrategies: string[];
  selectedBreakoutStrategies: string[];
}

export interface StrategiesTabProps {
  backtestTask: BacktestTask | undefined;
  onUpdateBacktestTask: (backtestTask: UpdateBacktestTaskRequest) => void;
  loading?: boolean;
}

const StrategiesTab: FC<StrategiesTabProps> = ({ loading = false, backtestTask, onUpdateBacktestTask }) => {
  const { t } = useTranslation();
  const [selectStrategiesModalOpen, setSelectStrategiesModalOpen] = useState<boolean>(false);

  const trendFollowingStrategies = (backtestTask?.selectedTrendFollowingStrategies ?? [])
  const breakoutStrategies = (backtestTask?.selectedBreakoutStrategies ?? [])

  
  const selectedTrendFollowingStrategies = useMemo(() => {
    return trendFollowingStrategies.map((strategy) => strategy.id);
  }, [trendFollowingStrategies]);

  const selectedBreakoutStrategies = useMemo(() => {
    return breakoutStrategies.map((strategy) => strategy.id);
  }, [breakoutStrategies]);

  const trendFollowingColumnTitles = useMemo(
    () => ({
      name: t('strategies.trendFollowing.columns.name'),
      ma_type: t('strategies.trendFollowing.columns.maType'),
      short_ma: t('strategies.trendFollowing.columns.shortMa'),
      long_ma: t('strategies.trendFollowing.columns.longMa'),
      adx_period: t('strategies.trendFollowing.columns.adxPeriod'),
      adx_threshold: t('strategies.trendFollowing.columns.adxThreshold'),
      leverage: t('strategies.trendFollowing.columns.leverage'),
    }),
    [t],
  );

  const breakoutColumnTitles = useMemo(
    () => ({
      name: t('strategies.breakout.columns.name'),
      lookback_period: t('strategies.breakout.columns.lookbackPeriod'),
      breakout_buffer: t('strategies.breakout.columns.breakoutBuffer'),
      min_volume_ratio: t('strategies.breakout.columns.minVolumeRatio'),
      leverage: t('strategies.breakout.columns.leverage'),
    }),
    [t],
  );

  const onOpenSelectStrategies = useCallback(() => {
    setSelectStrategiesModalOpen(true);
  }, []);

  const tabItems = [
    {
      key: 'trendFollowing',
      label: t('nav.trendFollowing'),
      children: (
        <div style={{ marginTop: 8 }}>
          <TrendFollowingTable
            dataSource={trendFollowingStrategies}
            loading={loading}
            columnTitles={trendFollowingColumnTitles}
            rowKey="id"
            hiddenColumns={['timeframe', 'stop_loss', 'take_profit']}
          />
          {trendFollowingStrategies.length === 0 && !loading && (
            <Typography.Text type="secondary">{t('backtest.detail.strategies.emptyTrendFollowing')}</Typography.Text>
          )}
        </div>
      ),
    },
    {
      key: 'breakout',
      label: t('nav.breakout'),
      children: (
        <div style={{ marginTop: 8 }}>
          <BreakoutStrategyTable
            dataSource={breakoutStrategies}
            loading={loading}
            columnTitles={breakoutColumnTitles}
            rowKey="id"
          />
          {breakoutStrategies.length === 0 && !loading && (
            <Typography.Text type="secondary">{t('backtest.detail.strategies.emptyBreakout')}</Typography.Text>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="strategies-tab">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
          {t('backtest.detail.tabs.strategies')} 
        </Typography.Title>
        <Button type="primary" onClick={onOpenSelectStrategies}>
          {t('backtest.detail.tabs.strategies.add')}
        </Button>
      </div>

      <Tabs defaultActiveKey="trendFollowing" items={tabItems} />
      <SelectStrategiesModal
        open={selectStrategiesModalOpen}
        selectedTrendFollowingStrategies={selectedTrendFollowingStrategies}
        selectedBreakoutStrategies={selectedBreakoutStrategies}
        onClose={() => setSelectStrategiesModalOpen(false)}
        onConfirm={({
          selectedBreakoutStrategies,
          selectedTrendFollowingStrategies,
        }) => {
          onUpdateBacktestTask({
            selectedTrendFollowingStrategies,
            selectedBreakoutStrategies,
          });
        }}
      />
    </div>
  );
};

export default StrategiesTab;
