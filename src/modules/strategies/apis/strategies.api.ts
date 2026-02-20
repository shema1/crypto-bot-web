const BASE = 'strategies';

export const strategiesUrls = {
  trendFollowing: `${BASE}/trend-following`,
  trendFollowingById: (id: string) => `${BASE}/trend-following/${id}`,
  trendFollowingBulk: `${BASE}/trend-following/bulk`,
} as const;
