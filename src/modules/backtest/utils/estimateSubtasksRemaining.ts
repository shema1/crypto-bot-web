const MIN_PROCESSED_SAMPLES = 3;

export interface EstimateSubtasksRemainingParams {
  processed: number;
  remaining: number;
  elapsedSeconds: number | null;
  minSamples?: number;
}

/** Approximate wall-clock seconds left; pass elapsed snapshotted when progress last changed. */
export function estimateSubtasksRemainingSeconds({
  processed,
  remaining,
  elapsedSeconds,
  minSamples = MIN_PROCESSED_SAMPLES,
}: EstimateSubtasksRemainingParams): number | null {
  if (
    processed < minSamples
    || elapsedSeconds == null
    || elapsedSeconds <= 0
    || remaining <= 0
  ) {
    return null;
  }

  const avgSecondsPerSubtask = elapsedSeconds / processed;
  return Math.ceil(remaining * avgSecondsPerSubtask);
}
