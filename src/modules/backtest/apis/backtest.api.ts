const BASE = 'backtest';

export const backtestUrls = {
  tasks: `${BASE}/tasks`,
  taskById: (taskId: string) => `${BASE}/tasks/${taskId}`,
  taskCopyById: (taskId: string) => `${BASE}/tasks/${taskId}/copy`,
  taskRunById: (taskId: string) => `${BASE}/tasks/${taskId}/run`,
  taskStopById: (taskId: string) => `${BASE}/tasks/${taskId}/stop`,
  taskOverviewById: (taskId: string) => `${BASE}/tasks/${taskId}/overview`,
  taskEventsById: (taskId: string) => `${BASE}/tasks/${taskId}/events`,
  taskLogsById: (taskId: string) => `${BASE}/tasks/${taskId}/logs`,
  taskResultsById: (taskId: string) => `${BASE}/tasks/${taskId}/results`,
  taskResultTradesById: (taskId: string, resultId: string) =>
    `${BASE}/tasks/${taskId}/results/${resultId}/trades`,
} as const;
