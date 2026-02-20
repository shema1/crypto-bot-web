import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../../core/baseQueries/mainBaseQuery';
import { trendFollowingStrategyUrls } from './trendFollowingStrategy.api';
import type {
  TrendFollowingStrategyItem,
  TrendFollowingStrategyListQuery,
  TrendFollowingStrategyListResponse,
  CreateTrendFollowingStrategyRequest,
  CreateTrendFollowingStrategiesBulkRequest,
} from '../types';

export const trendFollowingStrategyApi = createApi({
  reducerPath: 'trendFollowingStrategyApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['TrendFollowingStrategy'],
  endpoints: (builder) => ({
    getTrendFollowingStrategies: builder.query<
      TrendFollowingStrategyListResponse,
      TrendFollowingStrategyListQuery | void
    >({
      query: (params) => {
        const p = params ?? {};
        const queryParams: Record<string, string | number | undefined> = {
          page: p.page ?? 1,
          limit: p.limit ?? 20,
        };
        if (p.search?.trim()) queryParams.search = p.search.trim();
        if (p.sortBy != null) {
          queryParams.sortBy = p.sortBy;
          queryParams.sortOrder = p.sortOrder ?? 'asc';
        }
        return {
          url: trendFollowingStrategyUrls.list,
          params: queryParams,
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
      query: (id) => ({ url: trendFollowingStrategyUrls.byId(id) }),
      providesTags: (_result, _error, id) => [{ type: 'TrendFollowingStrategy', id }],
    }),
    createTrendFollowingStrategy: builder.mutation<
      TrendFollowingStrategyItem,
      CreateTrendFollowingStrategyRequest
    >({
      query: (body) => ({
        url: trendFollowingStrategyUrls.list,
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
        url: trendFollowingStrategyUrls.bulk,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'TrendFollowingStrategy', id: 'LIST' }],
    }),
    deleteTrendFollowingStrategy: builder.mutation<void, string>({
      query: (id) => ({
        url: trendFollowingStrategyUrls.byId(id),
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
} = trendFollowingStrategyApi;
