import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import type { CandleData, GetKlineParams, GetInstrumentsParams, InstrumentItem } from '../types';
import { bybitUrls } from './bybit.api';

export const bybitApi = createApi({
  reducerPath: 'bybitApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BybitKline', 'BybitInstruments'],
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
  }),
});

export const { useGetKlineQuery, useGetInstrumentsQuery } = bybitApi;
