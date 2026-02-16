/**
 * Types aligned with crypto-bot-helper backtest module and crypto-analysis-bot schemas.
 */

/** Single order record (matches backend BacktestOrderRecord). */
export interface BacktestOrderRecord {
  open_time: number;
  open_time_utc: string;
  open_price: number;
  target_price: number;
  lost_price: number;
  liquidation_price: number;
  close_time: number;
  close_time_utc: string;
  close_price: number;
  size: number;
  margin_used: number;
  is_liquidated: boolean;
  pnl: number;
  type: 'long' | 'short';
}

/** Params echoed in backtest result (request that was run). */
export interface BacktestResponseParams {
  name: string;
  strategy: 'TrendFollowing';
  pair: string;
  timeframe: string;
  short_ma: number;
  long_ma: number;
  adx_period: number;
  adx_threshold: number;
  stop_loss: string;
  take_profit: string;
  leverage: number;
  ma_type: 'EMA' | 'SMA';
}

/** Result summary stored in run (no orders_history; orders via GET .../orders). */
export interface BacktestResultSummary {
  params: BacktestResponseParams;
  total_orders: number;
  winning_orders: number;
  losing_orders: number;
  total_profit: number;
  total_loss: number;
  net_result: number;
  max_margin_used: number;
  roi_on_margin_pct: number | null;
  max_drawdown: number;
  average_pnl: number;
  win_rate: number;
  orders_count: number;
}

/** Error detail from analysis-bot (e.g. validation). */
export interface BacktestErrorDetail {
  type: string;
  loc: string[];
  msg: string;
  input?: Record<string, unknown>;
  ctx?: Record<string, unknown>;
}

/** Single error entry in run (failed backtest request). */
export interface BacktestRunError {
  name: string;
  error: string;
  detail?: BacktestErrorDetail[];
  input?: Record<string, unknown>;
}

/** Single strategy item for backtest run request. */
export interface BacktestStrategyItem {
  pair: string;
  timeframe: string;
  strategy: 'TrendFollowing';
}

/** Request body for POST /backtest (run). */
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

/** Full run detail (result summaries and errors). */
export interface BacktestRunDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  results: BacktestResultSummary[];
  errors: BacktestRunError[];
}

/** Orders for one result (GET runs/:runId/results/:resultIndex/orders). */
export type BacktestResultOrders = BacktestOrderRecord[];

/** Request body for POST /backtest/tasks (create task). */
export interface CreateBacktestTaskRequest {
  name: string;
}

/** Request body for PATCH /backtest/tasks/:taskId (update task). */
export interface UpdateBacktestTaskRequest {
  name?: string;
  candlesMeta?: string[];
  trendFollowingStrategies?: string[];
  selectedStrategies?: Record<string, string[]>;
  stopLoss?: number;
  takeProfit?: number;
  stopLossTakeProfitStep?: number;
}

/** Task status (matches backend BacktestTaskStatus). */
export enum BacktestTaskStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

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
