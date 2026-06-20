import {
  BYBIT_TIMEFRAMES,
  BYBIT_TIMEFRAME_LABELS,
  type BybitTimeframe,
} from '../../bybit/types';
import { bybitTimeframeToMs } from '../../bybit/utils/timeframeCandles.utils';

const ONE_MINUTE_MS = 60 * 1000;

/** Recommended candle count per timeframe (matches historic-pairs-data.service). */
export const RECOMMENDED_CANDLES_BY_TIMEFRAME: Record<BybitTimeframe, number> = {
  '1': 300_000,
  '3': 180_000,
  '5': 120_000,
  '15': 50_000,
  '30': 25_000,
  '60': 12_000,
  '120': 6_000,
  '240': 3_000,
  '360': 2_000,
  '720': 1_200,
  D: 600,
  W: 300,
  M: 200,
};

export interface TrendFollowingCandleSettings {
  long_ma?: number;
  adx_period?: number;
}

export interface BreakoutCandleSettings {
  lookback_period?: number;
}

/** Minimum bars for trend-following indicator warmup (matches trend_following.py). */
export function getTrendFollowingMinBars(settings: TrendFollowingCandleSettings): number {
  const longMa = settings.long_ma ?? 50;
  const adxPeriod = settings.adx_period ?? 14;
  return Math.max(longMa, adxPeriod * 2 + 1, 14) + 2;
}

/** Minimum bars for breakout indicator warmup (matches breakout.py). */
export function getBreakoutMinBars(settings: BreakoutCandleSettings): number {
  const lookback = settings.lookback_period ?? 10;
  return lookback + 2;
}

/** Convert N bars on a timeframe to equivalent 1-minute candle count (time coverage). */
export function getOneMinuteBarsEquivalent(bars: number, timeframe: BybitTimeframe): number {
  const timeframeMs = bybitTimeframeToMs(timeframe);
  if (!timeframeMs) return bars;
  return Math.round((bars * timeframeMs) / ONE_MINUTE_MS);
}

export interface TimeframeCandleRequirement {
  timeframe: BybitTimeframe;
  label: string;
  minBars: number;
  optimalBars: number;
  minBarsOneMinuteEq: number;
  optimalBarsOneMinuteEq: number;
}

export function buildTimeframeCandleRequirements(minBars: number): TimeframeCandleRequirement[] {
  return BYBIT_TIMEFRAMES.map((timeframe) => ({
    timeframe,
    label: BYBIT_TIMEFRAME_LABELS[timeframe],
    minBars,
    optimalBars: RECOMMENDED_CANDLES_BY_TIMEFRAME[timeframe],
    minBarsOneMinuteEq: getOneMinuteBarsEquivalent(minBars, timeframe),
    optimalBarsOneMinuteEq: getOneMinuteBarsEquivalent(
      RECOMMENDED_CANDLES_BY_TIMEFRAME[timeframe],
      timeframe
    ),
  }));
}

export function formatCandleCount(count: number): string {
  return count.toLocaleString();
}

export function formatOneMinuteEquivalent(minEq: number, optimalEq: number): string {
  return `${formatCandleCount(minEq)} / ${formatCandleCount(optimalEq)}`;
}
