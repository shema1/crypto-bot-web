/** Formats elapsed seconds as M:SS or H:MM:SS. */
export function formatRunDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Computes elapsed seconds between two ISO timestamps. */
export function computeRunDurationSeconds(
  runStartedAt?: string,
  runFinishedAt?: string,
): number | null {
  if (!runStartedAt || !runFinishedAt) return null;
  const startMs = new Date(runStartedAt).getTime();
  const endMs = new Date(runFinishedAt).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
  return Math.max(0, Math.floor((endMs - startMs) / 1000));
}
