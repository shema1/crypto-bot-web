import type { BybitTimeframe } from '../types/timeframes.type';

const MS_MINUTE = 60 * 1000;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;
const MS_WEEK = 7 * MS_DAY;
const MS_MONTH_APPROX = 30 * MS_DAY;

/** Parse Bybit kline interval to milliseconds (e.g. "60", "D", "1m"). */
export function bybitTimeframeToMs(timeframe: BybitTimeframe | string): number | null {
  const s = (timeframe ?? '').trim();
  if (!s) return null;

  const numMatch = s.match(/^(\d+)([mhdw])?$/i);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    const unit = (numMatch[2] ?? '').toLowerCase();
    if (unit === 'm') return n * MS_MINUTE;
    if (unit === 'h') return n * MS_HOUR;
    if (unit === 'd') return n * MS_DAY;
    if (unit === 'w') return n * MS_WEEK;
    return n * MS_MINUTE;
  }

  if (/^d$/i.test(s)) return MS_DAY;
  if (/^w$/i.test(s)) return MS_WEEK;
  if (/^m$/i.test(s)) return MS_MONTH_APPROX;
  return null;
}

/** Approximate candle count between two dates for a given timeframe. */
export function countCandlesInDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  timeframe: BybitTimeframe | string | undefined
): number | null {
  if (!startDate || !endDate || !timeframe) return null;

  const ms = bybitTimeframeToMs(timeframe);
  if (!ms || ms <= 0) return null;

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return null;

  return Math.floor((endMs - startMs) / ms);
}

export function formatApproxCandleCount(count: number | null): string | null {
  if (count === null) return null;
  return `~${count.toLocaleString()}`;
}
