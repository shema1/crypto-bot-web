import type { BybitTimeframe } from "../../bybit/types";
import type { BreakoutStrategyItem, TrendFollowingStrategyItem } from "../../strategies";

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

/** Populated meta from GET (HistoricPairMeta). */
export interface HistoricPairMetaPopulated {
  id: string;
  symbol?: string;
  interval?: string;
  oldestRecordDate?: string;
  newestRecordDate?: string;
  totalCandles?: number;
  provider?: string;
  pairStatus?: string;
  updatedAt?: string;
}

/** One entry in selectedPairs on GET (meta may be populated). @deprecated Used by legacy FuturesPairsTab. */
export interface SelectedPairItem {
  meta: string | HistoricPairMetaPopulated;
  startDate?: string;
  endDate?: string;
}

/** One entry for selectedPairs on PATCH (send id instead of meta). @deprecated Used by legacy FuturesPairsTab. */
export interface UpdateSelectedPairItem {
  id: string;
  startDate?: string;
  endDate?: string;
}


export interface BacktestStopLossTakeProfit {
  stopLoss: number;
  takeProfit: number;
  stopLossTakeProfitStep: number;
}

export interface BacktestIterationInfo {
  totalIterations: number;
  completedIterations: number;
  failedIterations: number;
}

export interface BacktestDateRange {
  /** Inclusive start date in YYYY-MM-DD format (no time component). */
  startDate: string;
  /** Inclusive end date in YYYY-MM-DD format (no time component). */
  endDate: string;
}
/** Backtest task (matches backend BacktestTask schema). API returns id (not _id). */
export interface BacktestTask {
  id: string;
  name: string;
  status: BacktestTaskStatus;
  selectedTrendFollowingStrategies: TrendFollowingStrategyItem[];
  selectedBreakoutStrategies: BreakoutStrategyItem[];
  selectedPairs: string[];
  selectedTimeframes: BybitTimeframe[];
  stopLossTakeProfit: BacktestStopLossTakeProfit;
  iterationInfo: BacktestIterationInfo;
  dateRange: BacktestDateRange;
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

/** Response from POST /backtest/tasks/:taskId/run. */
export interface RunBacktestTaskResponse {
  accepted: boolean;
  message: string;
  totalSubtasks?: number;
}

export const BacktestTaskLogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type BacktestTaskLogLevel = (typeof BacktestTaskLogLevel)[keyof typeof BacktestTaskLogLevel];

export const BacktestTaskLogSource = {
  BOT_HELPER: 'bot-helper',
  ANALYSIS_BOT: 'analysis-bot',
  HISTORIC_DATA: 'historic-data',
} as const;

export type BacktestTaskLogSource = (typeof BacktestTaskLogSource)[keyof typeof BacktestTaskLogSource];

/** Single execution log entry for a backtest task run. */
export interface BacktestTaskLogEntry {
  id: string;
  taskId: string;
  sequence: number;
  level: BacktestTaskLogLevel;
  source: BacktestTaskLogSource;
  stage: string;
  message: string;
  metadata?: Record<string, unknown>;
  subtaskIndex?: number;
  createdAt?: string;
}

export const BacktestSubtaskStatus = {
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type BacktestSubtaskStatus = (typeof BacktestSubtaskStatus)[keyof typeof BacktestSubtaskStatus];

export const BacktestSubtaskStrategyType = {
  TREND_FOLLOWING: 'trend_following',
  BREAKOUT: 'breakout',
} as const;

export type BacktestSubtaskStrategyType =
  (typeof BacktestSubtaskStrategyType)[keyof typeof BacktestSubtaskStrategyType];

export type TaskResultSortField =
  | 'roi_pct'
  | 'net_profit'
  | 'win_rate_pct'
  | 'sharpe_ratio'
  | 'profit_factor'
  | 'total_trades'
  | 'max_drawdown_pct'
  | 'subtask_index';

export type TaskResultSortOrder = 'asc' | 'desc';

export interface BacktestTaskResultSummary {
  netProfit: number;
  roiPct: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  winRatePct: number;
  profitFactor: number;
  totalTrades: number;
  initialCash: number;
  finalValue: number;
}

export interface BacktestTaskResultItem {
  id: string;
  taskId: string;
  subtaskIndex: number;
  strategyType: BacktestSubtaskStrategyType;
  status: BacktestSubtaskStatus;
  pair: string;
  timeframe: string;
  stopLossPct?: number;
  takeProfitPct?: number;
  summary?: BacktestTaskResultSummary;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTaskResultsQuery {
  sortBy?: TaskResultSortField;
  sortOrder?: TaskResultSortOrder;
  status?: BacktestSubtaskStatus | 'all';
  page?: number;
  limit?: number;
}

export interface GetTaskResultsResponse {
  items: BacktestTaskResultItem[];
  total: number;
  page: number;
  limit: number;
  sortBy: TaskResultSortField;
  sortOrder: TaskResultSortOrder;
}

export interface BacktestTradeRecord {
  ticket: number;
  type: 'long' | 'short';
  entry_time: string;
  entry_price: number;
  exit_time: string;
  exit_price: number;
  pnl: number;
  pnl_pct: number;
  exit_reason: string;
}

export interface GetTaskResultTradesQuery {
  page?: number;
  limit?: number;
}

export interface GetTaskResultTradesResponse {
  items: BacktestTradeRecord[];
  total: number;
  page: number;
  limit: number;
}

/** Request body for PATCH /backtest/tasks/:taskId. */
export interface UpdateBacktestTaskRequest {
  name?: string;
  selectedPairs?: string[];
  selectedTimeframes?: BybitTimeframe[];
  selectedTrendFollowingStrategies?: string[];
  selectedBreakoutStrategies?: string[];
  stopLossTakeProfit?: Partial<BacktestStopLossTakeProfit>;
  dateRange?: BacktestDateRange;
}
