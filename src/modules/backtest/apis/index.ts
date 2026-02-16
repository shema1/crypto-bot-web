import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import { backtestUrls } from './backtest.api';
import type {
  BacktestRunRequest,
  BacktestRunAcceptedResponse,
  GetRunsQuery,
  GetRunsResponse,
  BacktestRunDetail,
  BacktestResultOrders,
} from '../types';

export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BacktestRun'],
  endpoints: (builder) => ({
    runBacktest: builder.mutation<BacktestRunAcceptedResponse, BacktestRunRequest>({
      query: (body) => ({
        url: backtestUrls.run,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BacktestRun', id: 'LIST' }],
    }),
    getRuns: builder.query<GetRunsResponse, GetRunsQuery | void>({
      query: (params) => {
        const p = params ?? {};
        return {
          url: backtestUrls.runs,
          params: {
            page: p.page ?? 1,
            limit: p.limit ?? 20,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'BacktestRun' as const, id })),
              { type: 'BacktestRun', id: 'LIST' },
            ]
          : [{ type: 'BacktestRun', id: 'LIST' }],
    }),
    getRunById: builder.query<BacktestRunDetail, string>({
      query: (runId) => ({ url: backtestUrls.runById(runId) }),
      providesTags: (_result, _error, runId) => [{ type: 'BacktestRun', id: runId }],
    }),
    getOrdersForResult: builder.query<
      BacktestResultOrders,
      { runId: string; resultIndex: number }
    >({
      query: ({ runId, resultIndex }) => ({
        url: backtestUrls.ordersForResult(runId, resultIndex),
      }),
      providesTags: (_result, _error, { runId, resultIndex }) => [
        { type: 'BacktestRun', id: `${runId}-${resultIndex}` },
      ],
    }),
  }),
});

export const {
  useRunBacktestMutation,
  useGetRunsQuery,
  useGetRunByIdQuery,
  useGetOrdersForResultQuery,
} = backtestApi;
