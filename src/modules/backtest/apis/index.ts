import { createApi } from '@reduxjs/toolkit/query/react';
import createMainBaseQuery from '../../core/baseQueries/mainBaseQuery';
import { backtestUrls } from './backtest.api';
import type {
  GetTasksQuery,
  GetTasksResponse,
  CreateBacktestTaskRequest,
  UpdateBacktestTaskRequest,
  BacktestTask,
} from '../types';

export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: createMainBaseQuery(),
  tagTypes: ['BacktestTask'],
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
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = backtestApi;
