import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import type {
  CandleData,
  GetKlineParams,
  GetInstrumentsParams,
  GetSymbolsParams,
  InstrumentItem,
} from '../types';
import { bybitUrls } from './bybit.api';

export const bybitApi = createApi({
  reducerPath: 'bybitApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BybitKline', 'BybitInstruments', 'BybitSymbols'],
  endpoints: (builder) => ({
    getKline: builder.query<CandleData[], GetKlineParams>({
      query: (params) => ({
        url: bybitUrls.kline,
        params: {
          symbol: params.symbol ?? 'BTCUSDT',
          interval: params.interval ?? '60',
          start: params.start,
          end: params.end,
        },
      }),
      providesTags: (_result, _error, params) => [
        { type: 'BybitKline', id: `${params.symbol ?? 'BTCUSDT'}-${params.interval ?? '60'}-${params.start}-${params.end}` },
      ],
    }),
    getInstruments: builder.query<InstrumentItem[], GetInstrumentsParams | void>({
      query: (params) => ({
        url: bybitUrls.instruments,
        params: { category: params?.category ?? 'linear' },
      }),
      providesTags: (result, _error, params) =>
        result
          ? [{ type: 'BybitInstruments', id: params?.category ?? 'linear' }]
          : [{ type: 'BybitInstruments', id: 'LIST' }],
    }),
    getSymbols: builder.query<string[], GetSymbolsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | undefined> = {};
        if (params?.category) queryParams.category = params.category;
        if (params?.search?.trim()) queryParams.search = params.search.trim();
        return {
          url: bybitUrls.symbols,
          params: queryParams,
        };
      },
      providesTags: (_result, _error, params) => [
        {
          type: 'BybitSymbols',
          id: params?.search?.trim() || params?.category || 'LIST',
        },
      ],
    }),
  }),
});

export const {
  useGetKlineQuery,
  useGetInstrumentsQuery,
  useGetSymbolsQuery,
  useLazyGetSymbolsQuery,
} = bybitApi;
