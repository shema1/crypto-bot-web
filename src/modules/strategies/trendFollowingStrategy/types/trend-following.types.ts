/** MA type (matches backend MaTypeEnum) */
export type MaType = 'EMA' | 'SMA';

/** Bybit kline interval (matches backend KlineIntervalV3) */
export type Timeframe =
  | '1'
  | '3'
  | '5'
  | '15'
  | '30'
  | '60'
  | '120'
  | '240'
  | '360'
  | '720'
  | 'D'
  | 'W'
  | 'M';

export interface TrendFollowingStrategyItem {
  id: string;
  name: string;
  strategy: string;
  timeframe: Timeframe;
  ma_type: MaType;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  stop_loss: number;
  take_profit: number;
  leverage: number;
}

export interface GetTrendFollowingQueryParams {
  page?: number;
  limit?: number;
}

export interface GetTrendFollowingResponse {
  items: TrendFollowingStrategyItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTrendFollowingStrategyRequest {
  name: string;
  timeframe: Timeframe;
  ma_type: MaType;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  stop_loss: number;
  take_profit: number;
  leverage: number;
}

export interface CreateTrendFollowingStrategiesBulkRequest {
  strategy?: string;
  timeframes: Timeframe[];
  ma_type: MaType[];
  short_ma: number[];
  long_ma: number[];
  adx_period: number[];
  adx_threshold: number[];
  stop_loss: number;
  take_profit: number;
  take_lost_step?: number;
  leverage: number[];
}
