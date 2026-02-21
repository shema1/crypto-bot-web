/** Status from API (matches backend PairStatusEnum) */
export type PairStatus = 'syncing' | 'synced' | 'error';

export type PairStatusLabel = PairStatus;

/** Exchange that provides candle data (bybit, binance) */
export type ExchangeProvider = 'bybit' | 'binance';

/** Single meta item from GET (matches backend HistoricPairMetaItemDto). */
export interface HistoricPairMetaItem {
  id: string;
  symbol: string;
  interval: string;
  provider: ExchangeProvider;
  oldestRecordDate: string;
  newestRecordDate: string;
  totalCandles: number;
  pairStatus: PairStatus;
  updatedAt: string;
}

/** Sort field for GET meta (matches backend META_SORT_FIELDS) */
export const META_SORT_FIELDS = [
  'symbol',
  'interval',
  'provider',
  'oldestRecordDate',
  'newestRecordDate',
  'totalCandles',
  'pairStatus',
  'updatedAt',
] as const;
export type MetaSortField = (typeof META_SORT_FIELDS)[number];

export const SORT_ORDER_VALUES = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDER_VALUES)[number];

/** Query params for GET meta (pagination, search, sort) */
export interface GetMetaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: MetaSortField;
  sortOrder?: SortOrder;
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

/** PATCH meta/:id body (matches backend UpdateMetaDto). */
export interface UpdateMetaRequest {
  oldestRecordDate: string;
  newestRecordDate: string;
}

export interface UpdateMetaResponse {
  accepted: boolean;
  message: string;
}