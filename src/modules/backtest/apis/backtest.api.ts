const BASE = 'backtest';

export const backtestUrls = {
  tasks: `${BASE}/tasks`,
  taskById: (taskId: string) => `${BASE}/tasks/${taskId}`,
  taskRunById: (taskId: string) => `${BASE}/tasks/${taskId}/run`,
  taskEventsById: (taskId: string) => `${BASE}/tasks/${taskId}/events`,
  taskLogsById: (taskId: string) => `${BASE}/tasks/${taskId}/logs`,
  taskResultsById: (taskId: string) => `${BASE}/tasks/${taskId}/results`,
  taskResultTradesById: (taskId: string, resultId: string) =>
    `${BASE}/tasks/${taskId}/results/${resultId}/trades`,
} as const;
