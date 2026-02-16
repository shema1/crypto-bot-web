/** Single strategy item for backtest run request. */
export interface BacktestStrategyItem {
  pair: string;
  timeframe: string;
  strategy: 'TrendFollowing';
}

/** Request body for POST /backtest. */
export interface BacktestRunRequest {
  strategies: BacktestStrategyItem[];
}

/** Immediate response when backtest run is started in background. */
export interface BacktestRunAcceptedResponse {
  accepted: boolean;
  message: string;
}

/** Query params for GET /backtest/runs. */
export interface GetRunsQuery {
  page?: number;
  limit?: number;
}

/** Single run in paginated list. */
export interface BacktestRunListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  resultsCount: number;
  errorsCount: number;
}

/** Paginated list of backtest runs. */
export interface GetRunsResponse {
  items: BacktestRunListItem[];
  total: number;
  page: number;
  limit: number;
}

/** Full run detail (results summaries and errors). */
export interface BacktestRunDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  results: unknown[];
  errors: unknown[];
}

/** Orders for one result (GET runs/:runId/results/:resultIndex/orders). */
export type BacktestResultOrders = unknown[];
