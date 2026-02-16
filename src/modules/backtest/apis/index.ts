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
  GetTasksQuery,
  GetTasksResponse,
  CreateBacktestTaskRequest,
  UpdateBacktestTaskRequest,
  BacktestTask,
} from '../types';

export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BacktestRun', 'BacktestTask'],
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
    getTasks: builder.query<GetTasksResponse, GetTasksQuery | void>({
      query: (params) => {
        const p = params ?? {};
        return {
          url: backtestUrls.tasks,
          params: {
            search: p.search,
            sortBy: p.sortBy ?? 'createdAt',
            sortOrder: p.sortOrder ?? 'desc',
            page: p.page ?? 1,
            limit: p.limit ?? 20,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((task) => ({ type: 'BacktestTask' as const, id: task._id })),
              { type: 'BacktestTask', id: 'LIST' },
            ]
          : [{ type: 'BacktestTask', id: 'LIST' }],
    }),
    getTaskById: builder.query<BacktestTask, string>({
      query: (taskId) => ({ url: backtestUrls.taskById(taskId) }),
      providesTags: (_result, _error, taskId) => [{ type: 'BacktestTask', id: taskId }],
    }),
    createTask: builder.mutation<BacktestTask, CreateBacktestTaskRequest>({
      query: (body) => ({
        url: backtestUrls.tasks,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BacktestTask', id: 'LIST' }],
    }),
    updateTask: builder.mutation<BacktestTask, { taskId: string; body: UpdateBacktestTaskRequest }>({
      query: ({ taskId, body }) => ({
        url: backtestUrls.taskById(taskId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'BacktestTask', id: taskId },
        { type: 'BacktestTask', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useRunBacktestMutation,
  useGetRunsQuery,
  useGetRunByIdQuery,
  useGetOrdersForResultQuery,
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} = backtestApi;
