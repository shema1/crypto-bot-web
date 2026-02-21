const BASE = 'breakout-strategy';

export const breakoutStrategyUrls = {
  list: BASE,
  byId: (id: string) => `${BASE}/${id}`,
  bulk: `${BASE}/bulk`,
} as const;
