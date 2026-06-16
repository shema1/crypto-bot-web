/** Supported kline interval values for Bybit API (`interval` query param). */
export const BYBIT_TIMEFRAMES = [
  '1',
  '3',
  '5',
  '15',
  '30',
  '60',
  '120',
  '240',
  '360',
  '720',
  'D',
  'W',
  'M',
] as const;

export type BybitTimeframe = (typeof BYBIT_TIMEFRAMES)[number];

/** Default interval per Bybit API docs. */
export const DEFAULT_BYBIT_TIMEFRAME: BybitTimeframe = '60';

/** Human-readable labels for UI (e.g. select buttons). */
export const BYBIT_TIMEFRAME_LABELS: Record<BybitTimeframe, string> = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '360': '6h',
  '720': '12h',
  D: '1d',
  W: '1w',
  M: '1M',
};

export function isBybitTimeframe(value: string): value is BybitTimeframe {
  return (BYBIT_TIMEFRAMES as readonly string[]).includes(value);
}

export function sortBybitTimeframes(timeframes: BybitTimeframe[]): BybitTimeframe[] {
  const order = new Map(BYBIT_TIMEFRAMES.map((tf, index) => [tf, index]));
  return [...timeframes].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

/** @deprecated Use BYBIT_TIMEFRAMES */
export const KLINE_INTERVALS = BYBIT_TIMEFRAMES;

/** @deprecated Use BybitTimeframe */
export type KlineInterval = BybitTimeframe;
