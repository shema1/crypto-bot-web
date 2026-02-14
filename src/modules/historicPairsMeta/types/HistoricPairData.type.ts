/** Status from API (matches backend PairStatusEnum) */
export type PairStatus = 'syncing' | 'synced' | 'error';

export type PairStatusLabel = PairStatus;

/** Exchange that provides candle data (bybit, binance) */
export type ExchangeProvider = 'bybit' | 'binance';

export interface HistoricPairMetaItem {
  id: string;
  symbol: string;
  interval: string;
  provider: ExchangeProvider;
  firstRecordDate: string;
  lastRecordDate: string;
  totalCandles: number;
  pairStatus: PairStatus;
  updatedAt: string;
}

/** Query params for GET meta (pagination) */
export interface GetMetaQueryParams {
  page?: number;
  limit?: number;
}

export interface GetMetaResponse {
  items: HistoricPairMetaItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AddHistoricPairDataItem {
  symbol: string;
  interval: string;
  startDateTime: string;
  endDateTime: string;
  provider: ExchangeProvider;
}

export interface AddHistoricPairDataRequest {
  data: AddHistoricPairDataItem[];
}

export interface AddHistoricPairDataResponse {
  accepted: boolean;
  message: string;
  count: number;
}

export interface UpdateMetaRequest {
  firstRecordDate: string;
  lastRecordDate: string;
}

export interface UpdateMetaResponse {
  accepted: boolean;
  message: string;
}