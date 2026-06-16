import type { BybitTimeframe } from './timeframes.type';

export const INSTRUMENT_CATEGORIES = ['spot', 'linear'] as const;
export type InstrumentCategory = (typeof INSTRUMENT_CATEGORIES)[number];

/** Query params for GET bybit/kline */
export interface GetKlineParams {
  symbol?: string;
  interval?: BybitTimeframe;
  start: string;
  end: string;
}

/** Query params for GET bybit/instruments */
export interface GetInstrumentsParams {
  category?: InstrumentCategory;
}

/** Query params for GET bybit/symbols */
export interface GetSymbolsParams {
  category?: InstrumentCategory;
  search?: string;
}
