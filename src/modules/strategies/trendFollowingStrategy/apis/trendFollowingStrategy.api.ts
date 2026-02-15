const BASE = 'trend-following-strategy';

export const trendFollowingStrategyUrls = {
  list: BASE,
  byId: (id: string) => `${BASE}/${id}`,
  bulk: `${BASE}/bulk`,
} as const;
