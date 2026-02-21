import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../../core/baseQueries/mainBaseQuery';
import { breakoutStrategyUrls } from './breakoutStrategy.api';
import type {
  BreakoutStrategyItem,
  BreakoutStrategyListQuery,
  BreakoutStrategyListResponse,
  CreateBreakoutStrategyRequest,
  UpdateBreakoutStrategyRequest,
  CreateBreakoutStrategiesBulkRequest,
} from '../types';

export const breakoutStrategyApi = createApi({
  reducerPath: 'breakoutStrategyApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BreakoutStrategy'],
  endpoints: (builder) => ({
    getBreakoutStrategies: builder.query<
      BreakoutStrategyListResponse,
      BreakoutStrategyListQuery | void
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
          url: breakoutStrategyUrls.list,
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'BreakoutStrategy' as const,
                id,
              })),
              { type: 'BreakoutStrategy', id: 'LIST' },
            ]
          : [{ type: 'BreakoutStrategy', id: 'LIST' }],
    }),
    getBreakoutStrategyById: builder.query<BreakoutStrategyItem, string>({
      query: (id) => ({ url: breakoutStrategyUrls.byId(id) }),
      providesTags: (_result, _error, id) => [{ type: 'BreakoutStrategy', id }],
    }),
    createBreakoutStrategy: builder.mutation<
      BreakoutStrategyItem,
      CreateBreakoutStrategyRequest
    >({
      query: (body) => ({
        url: breakoutStrategyUrls.list,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BreakoutStrategy', id: 'LIST' }],
    }),
    updateBreakoutStrategy: builder.mutation<
      BreakoutStrategyItem,
      { id: string; body: UpdateBreakoutStrategyRequest }
    >({
      query: ({ id, body }) => ({
        url: breakoutStrategyUrls.byId(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'BreakoutStrategy', id },
        { type: 'BreakoutStrategy', id: 'LIST' },
      ],
    }),
    createBreakoutStrategiesBulk: builder.mutation<
      BreakoutStrategyItem[],
      CreateBreakoutStrategiesBulkRequest
    >({
      query: (body) => ({
        url: breakoutStrategyUrls.bulk,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BreakoutStrategy', id: 'LIST' }],
    }),
    deleteBreakoutStrategy: builder.mutation<void, string>({
      query: (id) => ({
        url: breakoutStrategyUrls.byId(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'BreakoutStrategy', id },
        { type: 'BreakoutStrategy', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetBreakoutStrategiesQuery,
  useLazyGetBreakoutStrategiesQuery,
  useGetBreakoutStrategyByIdQuery,
  useCreateBreakoutStrategyMutation,
  useUpdateBreakoutStrategyMutation,
  useCreateBreakoutStrategiesBulkMutation,
  useDeleteBreakoutStrategyMutation,
} = breakoutStrategyApi;
