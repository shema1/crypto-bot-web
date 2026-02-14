const BASE = 'historic-pairs-data';

export const historicPairsMetaUrls = {
  meta: `${BASE}/meta`,
  metaById: (id: string) => `${BASE}/meta/${id}`,
} as const;
