const BASE = 'backtest';

export const backtestUrls = {
  run: BASE,
  runs: `${BASE}/runs`,
  runById: (runId: string) => `${BASE}/runs/${runId}`,
  ordersForResult: (runId: string, resultIndex: number) =>
    `${BASE}/runs/${runId}/results/${resultIndex}/orders`,
} as const;
