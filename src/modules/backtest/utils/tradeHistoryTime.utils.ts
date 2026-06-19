import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const HAS_TZ_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/;

/** Parse trade history timestamp stored as UTC (supports legacy naive ISO strings). */
export function parseTradeHistoryUtcTime(value: string): dayjs.Dayjs {
  const trimmed = value.trim();
  if (!trimmed) {
    return dayjs.invalid();
  }
  if (HAS_TZ_SUFFIX.test(trimmed)) {
    return dayjs.utc(trimmed);
  }
  return dayjs.utc(trimmed);
}

/** Display UTC trade history timestamp in the browser local timezone. */
export function formatTradeHistoryTimeLocal(value: string | undefined | null): string {
  if (!value) {
    return '—';
  }
  const parsed = parseTradeHistoryUtcTime(value);
  if (!parsed.isValid()) {
    return value;
  }
  return parsed.local().format('DD/MM/YYYY HH:mm:ss');
}
