import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import { backtestUrls } from './backtest.api';
import {
  normalizeBacktestDateRange,
  normalizeBacktestDateRangeOptional,
} from '../utils';
import type {
  GetTasksQuery,
  GetTasksResponse,
  CreateBacktestTaskRequest,
  UpdateBacktestTaskRequest,
  RunBacktestTaskResponse,
  BacktestTask,
  BacktestTaskLogEntry,
  GetTaskResultsQuery,
  GetTaskResultsResponse,
  GetTaskResultTradesQuery,
  GetTaskResultTradesResponse,
} from '../types';

function normalizeBacktestTask(task: BacktestTask): BacktestTask {
  return {
    ...task,
    dateRange: normalizeBacktestDateRange(task.dateRange),
    selectedTrendFollowingStrategies: (task.selectedTrendFollowingStrategies ?? []).filter(Boolean),
    selectedBreakoutStrategies: (task.selectedBreakoutStrategies ?? []).filter(Boolean),
  };
}

function normalizeUpdateBacktestTaskRequest(body: UpdateBacktestTaskRequest): UpdateBacktestTaskRequest {
  if (!body.dateRange) return body;

  return {
    ...body,
    dateRange: normalizeBacktestDateRangeOptional(body.dateRange),
  };
}

export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BacktestTask', 'BacktestTaskLogs', 'BacktestTaskResults'],
  endpoints: (builder) => ({
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
              ...result.items.map((task) => ({ type: 'BacktestTask' as const, id: task.id })),
              { type: 'BacktestTask', id: 'LIST' },
            ]
          : [{ type: 'BacktestTask', id: 'LIST' }],
      transformResponse: (response: GetTasksResponse): GetTasksResponse => ({
        ...response,
        items: response.items.map(normalizeBacktestTask),
      }),
    }),
    getTaskById: builder.query<BacktestTask, string>({
      query: (taskId) => ({ url: backtestUrls.taskById(taskId) }),
      providesTags: (_result, _error, taskId) => [{ type: 'BacktestTask', id: taskId }],
      transformResponse: (response: BacktestTask): BacktestTask => normalizeBacktestTask(response),
    }),
    createTask: builder.mutation<BacktestTask, CreateBacktestTaskRequest>({
      query: (body) => ({
        url: backtestUrls.tasks,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BacktestTask', id: 'LIST' }],
      transformResponse: (response: BacktestTask): BacktestTask => normalizeBacktestTask(response),
    }),
    updateTask: builder.mutation<BacktestTask, { taskId: string; body: UpdateBacktestTaskRequest }>({
      query: ({ taskId, body }) => ({
        url: backtestUrls.taskById(taskId),
        method: 'PATCH',
        body: normalizeUpdateBacktestTaskRequest(body),
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'BacktestTask', id: taskId },
        { type: 'BacktestTask', id: 'LIST' },
      ],
      transformResponse: (response: BacktestTask): BacktestTask => normalizeBacktestTask(response),
    }),
    deleteTask: builder.mutation<void, string>({
      query: (taskId) => ({
        url: backtestUrls.taskById(taskId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: 'BacktestTask', id: taskId },
        { type: 'BacktestTask', id: 'LIST' },
      ],
    }),
    runTask: builder.mutation<RunBacktestTaskResponse, string>({
      query: (taskId) => ({
        url: backtestUrls.taskRunById(taskId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: 'BacktestTask', id: taskId },
        { type: 'BacktestTask', id: 'LIST' },
        { type: 'BacktestTaskLogs', id: taskId },
        { type: 'BacktestTaskResults', id: taskId },
      ],
    }),
    getTaskResults: builder.query<GetTaskResultsResponse, { taskId: string; query?: GetTaskResultsQuery }>({
      query: ({ taskId, query }) => ({
        url: backtestUrls.taskResultsById(taskId),
        params: {
          sortBy: query?.sortBy ?? 'roi_pct',
          sortOrder: query?.sortOrder ?? 'desc',
          status: query?.status ?? 'completed',
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      }),
      providesTags: (_result, _error, { taskId }) => [{ type: 'BacktestTaskResults', id: taskId }],
    }),
    getTaskResultTrades: builder.query<
      GetTaskResultTradesResponse,
      { taskId: string; resultId: string; query?: GetTaskResultTradesQuery }
    >({
      query: ({ taskId, resultId, query }) => ({
        url: backtestUrls.taskResultTradesById(taskId, resultId),
        params: {
          page: query?.page ?? 1,
          limit: query?.limit ?? 50,
        },
      }),
    }),
    getTaskLogs: builder.query<BacktestTaskLogEntry[], string>({
      query: (taskId) => ({ url: backtestUrls.taskLogsById(taskId) }),
      providesTags: (_result, _error, taskId) => [{ type: 'BacktestTaskLogs', id: taskId }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useRunTaskMutation,
  useGetTaskLogsQuery,
  useGetTaskResultsQuery,
  useGetTaskResultTradesQuery,
} = backtestApi;
