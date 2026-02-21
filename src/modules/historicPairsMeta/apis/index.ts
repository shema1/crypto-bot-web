import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import type {
  GetMetaQueryParams,
  GetMetaResponse,
  AddHistoricPairDataRequest,
  AddHistoricPairDataResponse,
  UpdateMetaRequest,
  UpdateMetaResponse,
} from '../types';
import { historicPairsMetaUrls } from './historicPairsMeta.api';

export const historicPairsMetaApi = createApi({
  reducerPath: 'historicPairsMetaApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['HistoricPairsMeta'],
  endpoints: (builder) => ({
    getMeta: builder.query<GetMetaResponse, GetMetaQueryParams | void>({
      query: (params) => {
        const p = params ?? {};
        const queryParams: Record<string, string | number | undefined> = {
          page: p.page ?? 1,
          limit: p.limit ?? 20,
        };
        if (p.search?.trim()) queryParams.search = p.search.trim();
        if (p.sortBy) queryParams.sortBy = p.sortBy;
        if (p.sortOrder) queryParams.sortOrder = p.sortOrder;
        return {
          url: historicPairsMetaUrls.meta,
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'HistoricPairsMeta' as const, id })),
              { type: 'HistoricPairsMeta', id: 'LIST' },
            ]
          : [{ type: 'HistoricPairsMeta', id: 'LIST' }],
    }),
    addHistoricPairData: builder.mutation<AddHistoricPairDataResponse, AddHistoricPairDataRequest>({
      query: (body) => ({
        url: historicPairsMetaUrls.meta,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'HistoricPairsMeta', id: 'LIST' }],
    }),
    deleteMeta: builder.mutation<void, string>({
      query: (id) => ({
        url: historicPairsMetaUrls.metaById(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'HistoricPairsMeta', id },
        { type: 'HistoricPairsMeta', id: 'LIST' },
      ],
    }),
    updateMeta: builder.mutation<UpdateMetaResponse, { id: string; body: UpdateMetaRequest }>({
      query: ({ id, body }) => ({
        url: historicPairsMetaUrls.metaById(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'HistoricPairsMeta', id },
        { type: 'HistoricPairsMeta', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMetaQuery,
  useLazyGetMetaQuery,
  useAddHistoricPairDataMutation,
  useDeleteMetaMutation,
  useUpdateMetaMutation,
} = historicPairsMetaApi;