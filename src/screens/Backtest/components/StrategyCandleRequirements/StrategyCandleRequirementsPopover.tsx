import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, Typography } from 'antd';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildTimeframeCandleRequirements,
  formatCandleCount,
  formatOneMinuteEquivalent,
} from '../../../../modules/backtest/utils/strategyCandles.utils';
import './StrategyCandleRequirements.css';

export interface StrategyCandleRequirementsPopoverProps {
  minBars: number;
  strategyName?: string;
  /** Strategy type label for accordion headers (shows typical defaults). */
  categoryLabel?: string;
  ariaLabel?: string;
}

const StrategyCandleRequirementsPopover: FC<StrategyCandleRequirementsPopoverProps> = ({
  minBars,
  strategyName,
  categoryLabel,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const requirements = buildTimeframeCandleRequirements(minBars);

  const introText = strategyName
    ? t('backtest.selectStrategiesModal.candleRequirements.introForStrategy', {
        name: strategyName,
        min: formatCandleCount(minBars),
      })
    : categoryLabel
      ? t('backtest.selectStrategiesModal.candleRequirements.introForCategory', {
          category: categoryLabel,
          min: formatCandleCount(minBars),
        })
      : t('backtest.selectStrategiesModal.candleRequirements.intro', {
          min: formatCandleCount(minBars),
        });

  const content: ReactNode = (
    <div className="strategy-candle-requirements">
      <Typography.Text className="strategy-candle-requirements__intro">
        {introText}
      </Typography.Text>
      <Typography.Text type="secondary" className="strategy-candle-requirements__hint">
        {t('backtest.selectStrategiesModal.candleRequirements.oneMinuteHint')}
      </Typography.Text>
      <table className="strategy-candle-requirements__table">
        <thead>
          <tr>
            <th>{t('backtest.selectStrategiesModal.candleRequirements.timeframe')}</th>
            <th>{t('backtest.selectStrategiesModal.candleRequirements.min')}</th>
            <th>{t('backtest.selectStrategiesModal.candleRequirements.optimal')}</th>
            <th>{t('backtest.selectStrategiesModal.candleRequirements.oneMinuteEq')}</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((row) => (
            <tr key={row.timeframe}>
              <td>{row.label}</td>
              <td>{formatCandleCount(row.minBars)}</td>
              <td>{formatCandleCount(row.optimalBars)}</td>
              <td className="strategy-candle-requirements__one-minute-cell">
                {formatOneMinuteEquivalent(row.minBarsOneMinuteEq, row.optimalBarsOneMinuteEq)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="left"
      overlayClassName="strategy-candle-requirements-popover"
    >
      <button
        type="button"
        className="strategy-candle-requirements__trigger"
        aria-label={
          ariaLabel ??
          (strategyName
            ? t('backtest.selectStrategiesModal.candleRequirements.triggerAriaLabelFor', {
                name: strategyName,
              })
            : t('backtest.selectStrategiesModal.candleRequirements.triggerAriaLabel'))
        }
        onClick={(event) => event.stopPropagation()}
      >
        <InfoCircleOutlined />
      </button>
    </Popover>
  );
};

export default StrategyCandleRequirementsPopover;
