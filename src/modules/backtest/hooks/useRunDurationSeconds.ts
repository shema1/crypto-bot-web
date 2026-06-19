import { useEffect, useState } from 'react';

/**
 * Returns elapsed run duration in seconds.
 * Ticks every second while `isRunning` is true.
 */
export function useRunDurationSeconds(
  runStartedAt: string | undefined,
  runFinishedAt: string | undefined,
  isRunning: boolean,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning || !runStartedAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, runStartedAt]);

  if (!runStartedAt) {
    return null;
  }

  const startMs = new Date(runStartedAt).getTime();
  if (Number.isNaN(startMs)) {
    return null;
  }

  if (isRunning) {
    return Math.max(0, Math.floor((now - startMs) / 1000));
  }

  if (runFinishedAt) {
    const endMs = new Date(runFinishedAt).getTime();
    if (!Number.isNaN(endMs)) {
      return Math.max(0, Math.floor((endMs - startMs) / 1000));
    }
  }

  return null;
}
