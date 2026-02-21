/** MA type (matches backend MaTypeEnum) */
export type MaType = 'EMA' | 'SMA';

/** Sort fields for list (matches backend TrendFollowingStrategySortField) */
export type TrendFollowingStrategySortField =
  | 'name'
  | 'ma_type'
  | 'short_ma'
  | 'long_ma'
  | 'adx_period'
  | 'adx_threshold'
  | 'leverage';

export type TrendFollowingStrategySortOrder = 'asc' | 'desc';

export interface TrendFollowingStrategyItem {
  id: string;
  name: string;
  strategy: string;
  ma_type: MaType;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  leverage: number;
}

export interface TrendFollowingStrategyListQuery {
  search?: string;
  sortBy?: TrendFollowingStrategySortField;
  sortOrder?: TrendFollowingStrategySortOrder;
  page?: number;
  limit?: number;
}

export interface TrendFollowingStrategyListResponse {
  items: TrendFollowingStrategyItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTrendFollowingStrategyRequest {
  name: string;
  ma_type: MaType;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  leverage: number;
}

export interface CreateTrendFollowingStrategiesBulkRequest {
  strategy?: string;
  ma_type: MaType[];
  short_ma: number[];
  long_ma: number[];
  adx_period: number[];
  adx_threshold: number[];
  leverage: number[];
}

export const TREND_FOLLOWING_STRATEGY_LIST_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 9999,
} as const;
