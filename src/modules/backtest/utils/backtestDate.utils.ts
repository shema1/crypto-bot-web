import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { BacktestDateRange } from '../types';

dayjs.extend(customParseFormat);

/** Date-only format for backtest dateRange fields (YYYY-MM-DD). */
export const BACKTEST_DATE_FORMAT = 'YYYY-MM-DD';

const BACKTEST_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function formatBacktestDate(value: dayjs.Dayjs | Date | string): string {
  return dayjs(value).format(BACKTEST_DATE_FORMAT);
}

export function parseBacktestDate(value: string): dayjs.Dayjs {
  if (BACKTEST_DATE_REGEX.test(value)) {
    return dayjs(value, BACKTEST_DATE_FORMAT);
  }

  return dayjs(value);
}

export function normalizeBacktestDate(value: string): string {
  if (!value) return value;
  return formatBacktestDate(parseBacktestDate(value));
}

export function normalizeBacktestDateRange(dateRange: BacktestDateRange): BacktestDateRange {
  return {
    startDate: normalizeBacktestDate(dateRange.startDate),
    endDate: normalizeBacktestDate(dateRange.endDate),
  };
}

export function normalizeBacktestDateRangeOptional(
  dateRange?: BacktestDateRange
): BacktestDateRange | undefined {
  if (!dateRange?.startDate || !dateRange?.endDate) return dateRange;
  return normalizeBacktestDateRange(dateRange);
}
