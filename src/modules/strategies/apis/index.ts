import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import type {
  GetTrendFollowingQueryParams,
  GetTrendFollowingResponse,
  TrendFollowingStrategyItem,
  CreateTrendFollowingStrategyRequest,
  CreateTrendFollowingStrategiesBulkRequest,
} from '../types';
import { strategiesUrls } from './strategies.api';

export const strategiesApi = createApi({
  reducerPath: 'strategiesApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['TrendFollowingStrategy'],
  endpoints: (builder) => ({
    getTrendFollowingStrategies: builder.query<
      GetTrendFollowingResponse,
      GetTrendFollowingQueryParams | void
>({
      query: (params) => {
        const p = params ?? {};
        return {
          url: strategiesUrls.trendFollowing,
          params: { page: p.page ?? 1, limit: p.limit ?? 20 },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'TrendFollowingStrategy' as const,
                id,
              })),
              { type: 'TrendFollowingStrategy', id: 'LIST' },
            ]
          : [{ type: 'TrendFollowingStrategy', id: 'LIST' }],
    }),
    getTrendFollowingStrategyById: builder.query<TrendFollowingStrategyItem, string>({
      query: (id) => ({ url: strategiesUrls.trendFollowingById(id) }),
      providesTags: (_result, _error, id) => [{ type: 'TrendFollowingStrategy', id }],
    }),
    createTrendFollowingStrategy: builder.mutation<
      TrendFollowingStrategyItem,
      CreateTrendFollowingStrategyRequest
    >({
      query: (body) => ({
        url: strategiesUrls.trendFollowing,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'TrendFollowingStrategy', id: 'LIST' }],
    }),
    createTrendFollowingStrategiesBulk: builder.mutation<
      TrendFollowingStrategyItem[],
      CreateTrendFollowingStrategiesBulkRequest
    >({
      query: (body) => ({
        url: strategiesUrls.trendFollowingBulk,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'TrendFollowingStrategy', id: 'LIST' }],
    }),
    deleteTrendFollowingStrategy: builder.mutation<void, string>({
      query: (id) => ({
        url: strategiesUrls.trendFollowingById(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'TrendFollowingStrategy', id },
        { type: 'TrendFollowingStrategy', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTrendFollowingStrategiesQuery,
  useGetTrendFollowingStrategyByIdQuery,
  useCreateTrendFollowingStrategyMutation,
  useCreateTrendFollowingStrategiesBulkMutation,
  useDeleteTrendFollowingStrategyMutation,
} = strategiesApi;
