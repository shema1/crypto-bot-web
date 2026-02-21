/** Sort fields for breakout strategy list (matches backend BreakoutStrategySortField) */
export type BreakoutStrategySortField =
  | 'name'
  | 'lookback_period'
  | 'breakout_buffer'
  | 'min_volume_ratio'
  | 'leverage';

/** Sort order (matches backend BreakoutStrategySortOrder) */
export type BreakoutStrategySortOrder = 'asc' | 'desc';

export interface BreakoutStrategyItem {
  id: string;
  name: string;
  strategy: string;
  lookback_period: number;
  breakout_buffer: number;
  min_volume_ratio: number;
  leverage: number;
}

export interface BreakoutStrategyListQuery {
  search?: string;
  sortBy?: BreakoutStrategySortField;
  sortOrder?: BreakoutStrategySortOrder;
  page?: number;
  limit?: number;
}

export interface BreakoutStrategyListResponse {
  items: BreakoutStrategyItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBreakoutStrategyRequest {
  name: string;
  lookback_period: number;
  breakout_buffer: number;
  min_volume_ratio: number;
  leverage: number;
}

export interface UpdateBreakoutStrategyRequest {
  name?: string;
  lookback_period?: number;
  breakout_buffer?: number;
  min_volume_ratio?: number;
  leverage?: number;
}

export interface CreateBreakoutStrategiesBulkRequest {
  lookback_period: number[];
  breakout_buffer: number[];
  min_volume_ratio: number[];
  leverage: number[];
}

export const BREAKOUT_STRATEGY_LIST_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 9999,
} as const;
