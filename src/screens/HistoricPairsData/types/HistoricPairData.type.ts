/** Numeric status from API: 0 = syncing, 1 = synced, 2 = error */
export type PairStatus = 0 | 1 | 2;

export type PairStatusLabel = 'syncing' | 'synced' | 'error';

export type Provider = "bybit" | "binance";

export interface HistoricPairDataItem {
    id: string;
    symbol: string;
    interval: string;
    totalCandles: number;
    firstRecordDate: string;
    lastRecordDate: string;
    pairStatus: PairStatus;
    provider: Provider
}


export interface NewHistoricPair  {
    symbol: string;
    interval: string;
    startDateTime: string;
    endDateTime: string;
    provider: Provider
}