import type { MaType } from './ma-type.type';

/** Single trend following strategy item (API response) */
export interface TrendFollowingStrategyItem {
  id: string;
  name: string;
  strategy: 'TrendFollowing';
  timeframe: string;
  ma_type: MaType;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  stop_loss: number;
  take_profit: number;
  leverage: number;
}

/** Sort field for list (matches backend SORT_FIELDS) */
export const TREND_FOLLOWING_SORT_FIELDS = [
  'name',
  'ma_type',
  'short_ma',
  'long_ma',
  'adx_period',
  'adx_threshold',
  'leverage',
] as const;
export type TrendFollowingStrategySortField = (typeof TREND_FOLLOWING_SORT_FIELDS)[number];

export const TREND_FOLLOWING_SORT_ORDERS = ['asc', 'desc'] as const;
export type TrendFollowingStrategySortOrder = (typeof TREND_FOLLOWING_SORT_ORDERS)[number];

/** Query params for GET list (pagination, search, sort) */
export interface TrendFollowingStrategyListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: TrendFollowingStrategySortField;
  sortOrder?: TrendFollowingStrategySortOrder;
}

export const TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

/** Paginated list response */
export interface TrendFollowingStrategyListResponse {
  items: TrendFollowingStrategyItem[];
  total: number;
  page: number;
  limit: number;
}

/** Request body for creating a single strategy */
export interface CreateTrendFollowingStrategyRequest {
  name: string;
  timeframe: string;
  ma_type: MaType;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  stop_loss: number;
  take_profit: number;
  leverage: number;
}

/** Request body for bulk create (all parameter combinations) */
export interface CreateTrendFollowingStrategiesBulkRequest {
  strategy?: string;
  timeframes: string[];
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
