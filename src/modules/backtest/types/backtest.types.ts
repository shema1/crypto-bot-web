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

/** Sort field for GET /backtest/tasks. */
export type GetTasksSortField = 'createdAt' | 'updatedAt' | 'name' | 'status';

/** Sort order for GET /backtest/tasks. */
export type GetTasksSortOrder = 'asc' | 'desc';

/** Query params for GET /backtest/tasks. */
export interface GetTasksQuery {
  search?: string;
  sortBy?: GetTasksSortField;
  sortOrder?: GetTasksSortOrder;
  page?: number;
  limit?: number;
}

/** Task status (matches backend BacktestTaskStatus). */
export const BacktestTaskStatus = {
  CREATED: 'created',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type BacktestTaskStatus = (typeof BacktestTaskStatus)[keyof typeof BacktestTaskStatus];

/** Backtest task (matches backend BacktestTask schema). */
export interface BacktestTask {
  _id: string;
  name: string;
  status: BacktestTaskStatus;
  trendFollowingStrategies: string[];
  candlesMeta: string[];
  selectedStrategies: Record<string, string[]>;
  totalIterations: number;
  completedIterations: number;
  failedIterations: number;
  stopLoss: number;
  takeProfit: number;
  stopLossTakeProfitStep: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated list of backtest tasks. */
export interface GetTasksResponse {
  items: BacktestTask[];
  total: number;
  page: number;
  limit: number;
}

/** Request body for POST /backtest/tasks. */
export interface CreateBacktestTaskRequest {
  name: string;
}

/** Request body for PATCH /backtest/tasks/:taskId. */
export interface UpdateBacktestTaskRequest {
  name?: string;
  candlesMeta?: string[];
  trendFollowingStrategies?: string[];
  selectedStrategies?: Record<string, string[]>;
  stopLoss?: number;
  takeProfit?: number;
  stopLossTakeProfitStep?: number;
}
