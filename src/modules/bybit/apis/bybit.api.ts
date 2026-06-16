const BASE = 'bybit';

export const bybitUrls = {
  kline: `${BASE}/kline`,
  instruments: `${BASE}/instruments`,
  symbols: `${BASE}/symbols`,
} as const;
