import { DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestDateRange } from '../../../../../../../../modules/backtest';

const { RangePicker } = DatePicker;

export interface DateConfigProps {
  dateRange: BacktestDateRange;
  disabled?: boolean;
  onChange: (dateRange: BacktestDateRange) => void;
}

const DateConfig: FC<DateConfigProps> = ({ dateRange, disabled = false, onChange }) => {
  const { t } = useTranslation();

  const rangeValue: [Dayjs, Dayjs] | null =
    dateRange.startDate && dateRange.endDate
      ? [dayjs(dateRange.startDate), dayjs(dateRange.endDate)]
      : null;

  const handleRangeChange = useCallback(
    (value: [Dayjs | null, Dayjs | null] | null) => {
      if (!value?.[0] || !value[1]) return;
      onChange({
        startDate: value[0].toISOString(),
        endDate: value[1].toISOString(),
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
        showTime
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
