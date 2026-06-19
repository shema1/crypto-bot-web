import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../core/baseQueries/mainBaseQuery';
import { backtestUrls } from '../apis/backtest.api';
import { useGetTaskLogsQuery } from '../apis';
import type { BacktestTaskLogEntry } from '../types';

function mergeLogEntries(
  existing: BacktestTaskLogEntry[],
  incoming: BacktestTaskLogEntry[],
): BacktestTaskLogEntry[] {
  const byKey = new Map<string, BacktestTaskLogEntry>();
  for (const entry of existing) {
    byKey.set(`${entry.sequence}`, entry);
  }
  for (const entry of incoming) {
    byKey.set(`${entry.sequence}`, entry);
  }
  return [...byKey.values()].sort((a, b) => a.sequence - b.sequence);
}

export function useBacktestTaskLogs(taskId: string | undefined) {
  const { data: fetchedLogs, isLoading, refetch } = useGetTaskLogsQuery(taskId!, {
    skip: !taskId,
  });
  const [logs, setLogs] = useState<BacktestTaskLogEntry[]>([]);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (fetchedLogs) {
      setLogs(fetchedLogs);
    }
  }, [fetchedLogs]);

  const appendLog = useCallback((entry: BacktestTaskLogEntry) => {
    setLogs((prev) => mergeLogEntries(prev, [entry]));
  }, []);

  useEffect(() => {
    if (!taskId) return undefined;

    const url = `${API_BASE_URL}${backtestUrls.taskEventsById(taskId)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('task-log', (event) => {
      try {
        const entry = JSON.parse(event.data) as BacktestTaskLogEntry;
        appendLog(entry);
      } catch {
        // ignore malformed SSE payload
      }
    });

    eventSource.addEventListener('task-updated', () => {
      void refetchRef.current();
    });

    return () => {
      eventSource.close();
    };
  }, [taskId, appendLog]);

  return { logs, isLoading, refetch };
}
