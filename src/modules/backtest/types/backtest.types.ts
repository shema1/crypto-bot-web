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
  startDate: string;
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
