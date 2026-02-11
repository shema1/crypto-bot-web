import { PAIR_STATUS } from '../constants';
import type { PairStatus, PairStatusLabel } from '../types/HistoricPairData.type';

export function getPairStatusLabel(status: PairStatus): PairStatusLabel {
    return PAIR_STATUS[status];
}
