import type { PairStatus, PairStatusLabel } from "../types";

export const PAIR_STATUS: Record<PairStatus, PairStatusLabel> = {
    0: 'syncing',
    1: 'synced',
    2: 'error',
};

