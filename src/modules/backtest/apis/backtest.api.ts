const BASE = 'backtest';

export const backtestUrls = {
  tasks: `${BASE}/tasks`,
  taskById: (taskId: string) => `${BASE}/tasks/${taskId}`,
} as const;
