const BASE = 'bybit';

export const bybitUrls = {
  kline: `${BASE}/kline`,
  instruments: `${BASE}/instruments`,
  symbols: `${BASE}/symbols`,
  futuresPairs: `${BASE}/futures-pairs`,
} as const;
