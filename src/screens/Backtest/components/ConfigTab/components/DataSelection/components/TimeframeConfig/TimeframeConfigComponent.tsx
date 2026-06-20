import { Button, Typography } from 'antd';
import { useCallback, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestDateRange } from '../../../../../../../../modules/backtest';
import {
  countCandlesInDateRange,
  formatApproxCandleCount,
} from '../../../../../../../../modules/bybit/utils/timeframeCandles.utils';
import {
  BYBIT_TIMEFRAME_LABELS,
  BYBIT_TIMEFRAMES,
  sortBybitTimeframes,
  type BybitTimeframe,
} from '../../../../../../../../modules/bybit/types';

export interface TimeframeConfigProps {
  timeframes: BybitTimeframe[];
  dateRange?: BacktestDateRange;
  disabled?: boolean;
  onChange: (timeframes: BybitTimeframe[]) => void;
}

const TimeframeConfig: FC<TimeframeConfigProps> = ({
  timeframes,
  dateRange,
  disabled = false,
  onChange,
}) => {
  const { t } = useTranslation();

  const candleCountsByTimeframe = useMemo(() => {
    const counts = new Map<BybitTimeframe, string>();

    for (const tf of BYBIT_TIMEFRAMES) {
      const formatted = formatApproxCandleCount(
        countCandlesInDateRange(dateRange?.startDate, dateRange?.endDate, tf)
      );
      if (formatted) counts.set(tf, formatted);
    }

    return counts;
  }, [dateRange?.endDate, dateRange?.startDate]);

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
          const candleCount = candleCountsByTimeframe.get(tf);
          return (
            <Button
              key={tf}
              className="data-selection__timeframe-btn"
              disabled={disabled}
              type={active ? 'primary' : 'default'}
              ghost={active}
              onClick={() => toggleTimeframe(tf)}
              aria-pressed={active}
              aria-label={
                candleCount
                  ? t('backtest.config.dataSelection.timeframes.buttonAriaLabel', {
                      timeframe: BYBIT_TIMEFRAME_LABELS[tf],
                      candles: candleCount,
                    })
                  : BYBIT_TIMEFRAME_LABELS[tf]
              }
            >
              <span className="data-selection__timeframe-btn-label">{BYBIT_TIMEFRAME_LABELS[tf]}</span>
              {candleCount ? (
                <span className="data-selection__timeframe-btn-candles">{candleCount}</span>
              ) : null}
            </Button>
          );
        })}
      </div>
    </section>
  );
};

export default TimeframeConfig;
