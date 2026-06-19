const BASE = 'backtest';

export const backtestUrls = {
  tasks: `${BASE}/tasks`,
  taskById: (taskId: string) => `${BASE}/tasks/${taskId}`,
  taskRunById: (taskId: string) => `${BASE}/tasks/${taskId}/run`,
  taskEventsById: (taskId: string) => `${BASE}/tasks/${taskId}/events`,
  taskLogsById: (taskId: string) => `${BASE}/tasks/${taskId}/logs`,
} as const;
