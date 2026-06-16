import type { HistoricPairMetaItem } from '../../../../../../modules/historicPairsMeta/types/HistoricPairData.type';
import type { SelectedPairItem, UpdateSelectedPairItem } from '../../../../../../modules/backtest';
import {
  isBybitTimeframe,
  sortBybitTimeframes,
  type BybitTimeframe,
} from '../../../../../../modules/bybit/types';

export function getMetaId(meta: SelectedPairItem['meta']): string {
  return typeof meta === 'string' ? meta : meta.id;
}

export function getSymbol(meta: SelectedPairItem['meta']): string | undefined {
  if (typeof meta === 'string') return undefined;
  return meta.symbol;
}

export function getInterval(meta: SelectedPairItem['meta']): string | undefined {
  if (typeof meta === 'string') return undefined;
  return meta.interval;
}

export function normalizeInterval(interval: string): string {
  return interval.trim().toLowerCase();
}

export function intervalsMatch(a: string, b: string): boolean {
  return normalizeInterval(a) === normalizeInterval(b);
}

export interface DataSelectionState {
  symbols: string[];
  timeframes: BybitTimeframe[];
  startDate?: string;
  endDate?: string;
}

export function parseStateFromSelectedPairs(pairs: SelectedPairItem[]): DataSelectionState {
  const symbols = new Set<string>();
  const timeframes = new Set<BybitTimeframe>();
  const startDates: string[] = [];
  const endDates: string[] = [];

  for (const pair of pairs) {
    const symbol = getSymbol(pair.meta);
    const interval = getInterval(pair.meta);
    if (symbol) symbols.add(symbol);
    if (interval && isBybitTimeframe(interval)) timeframes.add(interval);
    if (pair.startDate) startDates.push(pair.startDate);
    if (pair.endDate) endDates.push(pair.endDate);
  }

  const uniqueStarts = [...new Set(startDates)];
  const uniqueEnds = [...new Set(endDates)];

  return {
    symbols: [...symbols].sort(),
    timeframes: sortBybitTimeframes([...timeframes]),
    startDate: uniqueStarts.length === 1 ? uniqueStarts[0] : undefined,
    endDate: uniqueEnds.length === 1 ? uniqueEnds[0] : undefined,
  };
}

function findMetaForPair(
  allMeta: HistoricPairMetaItem[],
  symbol: string,
  interval: string,
  preferredId?: string
): HistoricPairMetaItem | undefined {
  if (preferredId) {
    const byId = allMeta.find((m) => m.id === preferredId);
    if (byId && byId.symbol === symbol && intervalsMatch(byId.interval, interval)) return byId;
  }
  return allMeta.find((m) => m.symbol === symbol && intervalsMatch(m.interval, interval));
}

export function buildUpdateSelectedPairs(
  state: DataSelectionState,
  allMeta: HistoricPairMetaItem[],
  existingPairs: SelectedPairItem[]
): UpdateSelectedPairItem[] {
  const { symbols, timeframes, startDate, endDate } = state;
  if (!symbols.length || !timeframes.length) return [];

  const existingByKey = new Map<string, SelectedPairItem>();
  for (const pair of existingPairs) {
    const symbol = getSymbol(pair.meta);
    const interval = getInterval(pair.meta);
    if (!symbol || !interval) continue;
    existingByKey.set(`${symbol}::${normalizeInterval(interval)}`, pair);
  }

  const items: UpdateSelectedPairItem[] = [];

  for (const symbol of symbols) {
    for (const interval of timeframes) {
      const key = `${symbol}::${normalizeInterval(interval)}`;
      const existing = existingByKey.get(key);
      const preferredId = existing ? getMetaId(existing.meta) : undefined;
      const meta = findMetaForPair(allMeta, symbol, interval, preferredId);
      if (!meta) continue;

      const fallbackStart = meta.oldestRecordDate;
      const fallbackEnd = meta.newestRecordDate;

      items.push({
        id: meta.id,
        startDate: startDate ?? existing?.startDate ?? fallbackStart,
        endDate: endDate ?? existing?.endDate ?? fallbackEnd,
      });
    }
  }

  return items;
}

export function getUniqueSymbols(allMeta: HistoricPairMetaItem[]): string[] {
  const symbols = new Set<string>();
  for (const item of allMeta) {
    if (item.symbol) symbols.add(item.symbol);
  }
  return [...symbols].sort();
}

export function filterSymbolsBySearch(symbols: string[], search: string): string[] {
  const q = search.trim().toLowerCase();
  if (!q) return [];
  return symbols.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
}
