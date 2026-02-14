import type { PairStatus, PairStatusLabel } from "../types";

export const PAIR_STATUS: Record<PairStatus, PairStatusLabel> = {
  syncing: 'syncing',
  synced: 'synced',
  error: 'error',
};

