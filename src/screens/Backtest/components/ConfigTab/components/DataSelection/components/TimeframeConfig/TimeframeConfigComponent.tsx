import { Button, Typography } from 'antd';
import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BYBIT_TIMEFRAME_LABELS,
  BYBIT_TIMEFRAMES,
  sortBybitTimeframes,
  type BybitTimeframe,
} from '../../../../../../../../modules/bybit/types';

export interface TimeframeConfigProps {
  timeframes: BybitTimeframe[];
  disabled?: boolean;
  onChange: (timeframes: BybitTimeframe[]) => void;
}

const TimeframeConfig: FC<TimeframeConfigProps> = ({
  timeframes,
  disabled = false,
  onChange,
}) => {
  const { t } = useTranslation();

  const toggleTimeframe = useCallback(
    (tf: BybitTimeframe) => {
      const has = timeframes.includes(tf);
      const next = sortBybitTimeframes(
        has ? timeframes.filter((item) => item !== tf) : [...timeframes, tf]
      );
      onChange(next);
    },
    [timeframes, onChange]
  );

  return (
    <section className="data-selection__section" aria-labelledby="data-selection-timeframes-title">
      <div className="data-selection__section-header">
        <h3 id="data-selection-timeframes-title" className="data-selection__section-title">
          {t('backtest.config.dataSelection.timeframes.title')}
        </h3>
      </div>
      <Typography.Text type="secondary" className="data-selection__section-hint">
        {t('backtest.config.dataSelection.timeframes.hint')}
      </Typography.Text>
      <div className="data-selection__timeframes">
        {BYBIT_TIMEFRAMES.map((tf) => {
          const active = timeframes.includes(tf);
          return (
            <Button
              key={tf}
              className="data-selection__timeframe-btn"
              disabled={disabled}
              type={active ? 'primary' : 'default'}
              ghost={active}
              onClick={() => toggleTimeframe(tf)}
              aria-pressed={active}
            >
              {BYBIT_TIMEFRAME_LABELS[tf]}
            </Button>
          );
        })}
      </div>
    </section>
  );
};

export default TimeframeConfig;
