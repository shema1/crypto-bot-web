export const KLINE_INTERVALS = [
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

export type KlineInterval = (typeof KLINE_INTERVALS)[number];

export const INSTRUMENT_CATEGORIES = ['spot', 'linear'] as const;
export type InstrumentCategory = (typeof INSTRUMENT_CATEGORIES)[number];

/** Query params for GET bybit/kline */
export interface GetKlineParams {
  symbol?: string;
  interval?: KlineInterval;
  start: string;
  end: string;
}

/** Query params for GET bybit/instruments */
export interface GetInstrumentsParams {
  category?: InstrumentCategory;
}
