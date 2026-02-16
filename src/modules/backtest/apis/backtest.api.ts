const BASE = 'backtest';

export const backtestUrls = {
  run: BASE,
  runs: `${BASE}/runs`,
  runById: (runId: string) => `${BASE}/runs/${runId}`,
  ordersForResult: (runId: string, resultIndex: number) =>
    `${BASE}/runs/${runId}/results/${resultIndex}/orders`,
  tasks: `${BASE}/tasks`,
  taskById: (taskId: string) => `${BASE}/tasks/${taskId}`,
} as const;
