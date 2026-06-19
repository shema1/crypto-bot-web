import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../core/baseQueries/mainBaseQuery';
import { backtestUrls } from '../apis/backtest.api';

const DEFAULT_EVENTS = ['task-progress', 'task-updated', 'task-stop-requested'] as const;

export function useBacktestTaskLiveEvents(
  taskId: string | undefined,
  onEvent: () => void,
  events: readonly string[] = DEFAULT_EVENTS,
): void {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!taskId) return undefined;

    const url = `${API_BASE_URL}${backtestUrls.taskEventsById(taskId)}`;
    const eventSource = new EventSource(url);

    const handleEvent = () => {
      onEventRef.current();
    };

    for (const eventName of events) {
      eventSource.addEventListener(eventName, handleEvent);
    }

    return () => {
      eventSource.close();
    };
  }, [taskId, events]);
}
