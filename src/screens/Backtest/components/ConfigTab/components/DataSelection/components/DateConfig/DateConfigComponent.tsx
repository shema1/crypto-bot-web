import { DatePicker } from 'antd';
import { type Dayjs } from 'dayjs';
import { useCallback, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BACKTEST_DATE_FORMAT,
  formatBacktestDate,
  parseBacktestDate,
  type BacktestDateRange,
} from '../../../../../../../../modules/backtest';

const { RangePicker } = DatePicker;

export interface DateConfigProps {
  dateRange: BacktestDateRange;
  disabled?: boolean;
  onChange: (dateRange: BacktestDateRange) => void;
}

const DateConfig: FC<DateConfigProps> = ({ dateRange, disabled = false, onChange }) => {
  const { t } = useTranslation();

  const rangeValue = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;

    return [parseBacktestDate(dateRange.startDate), parseBacktestDate(dateRange.endDate)];
  }, [dateRange.endDate, dateRange.startDate]);

  const handleRangeChange = useCallback(
    (value: [Dayjs | null, Dayjs | null] | null) => {
      if (!value?.[0] || !value[1]) return;
      onChange({
        startDate: formatBacktestDate(value[0]),
        endDate: formatBacktestDate(value[1]),
      });
    },
    [onChange]
  );

  return (
    <section className="data-selection__section" aria-labelledby="data-selection-date-range-title">
      <div className="data-selection__section-header">
        <h3 id="data-selection-date-range-title" className="data-selection__section-title">
          {t('backtest.config.dataSelection.dateRange.title')}
        </h3>
      </div>
      <RangePicker
        value={rangeValue}
        onChange={handleRangeChange}
        disabled={disabled}
        format={BACKTEST_DATE_FORMAT}
        style={{ width: '100%' }}
        placeholder={[
          t('backtest.config.dataSelection.dateRange.startPlaceholder'),
          t('backtest.config.dataSelection.dateRange.endPlaceholder'),
        ]}
      />
    </section>
  );
};

export default DateConfig;
