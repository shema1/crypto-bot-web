/** Result summary shape from API (matches backend BacktestResultSummary). */
export interface ResultSummary {
  params?: { name?: string; pair?: string; timeframe?: string };
  total_orders?: number;
  winning_orders?: number;
  losing_orders?: number;
  net_result?: number;
  win_rate?: number;
  roi_on_margin_pct?: number | null;
  orders_count?: number;
}

/** Error item shape from API. */
export interface BacktestErrorItem {
  name?: string;
  error?: string;
}

/** Run detail from API (subset used by tab components). */
export interface BacktestRunDetailRun {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  results?: unknown[];
  errors?: unknown[];
}

/** Pair + timeframe with result count. */
export interface PairTimeframeCount {
  pair: string;
  timeframe: string;
  count: number;
}
