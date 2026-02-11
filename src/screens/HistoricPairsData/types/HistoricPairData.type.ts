/** Numeric status from API: 0 = syncing, 1 = synced, 2 = error */
export type PairStatus = 0 | 1 | 2;

export type PairStatusLabel = 'syncing' | 'synced' | 'error';

export interface HistoricPairDataItem {
    symbol: string;
    interval: string;
    candelsNumber: number;
    firstRecordDate: string;
    lastRecordDate: string;
    pairStatus: PairStatus;
}


export interface NewHistoricPair  {
    symbol: string;
    interval: string;
    startDateTime: string;
    endDateTime: string;
}