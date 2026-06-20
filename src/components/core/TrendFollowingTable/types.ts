import type { Key, ReactNode } from 'react';

/** Row shape expected by TrendFollowingTable (compatible with TrendFollowingStrategyItem). */
export interface TrendFollowingStrategyTableRow {
  id: string;
  name?: string;
  timeframe?: string;
  ma_type?: string;
  short_ma?: number;
  long_ma?: number;
  adx_period?: number;
  adx_threshold?: number;
  stop_loss?: number;
  take_profit?: number;
  leverage?: number;
}

/** Sort field for table columns. */
export type TrendFollowingTableSortField =
  | 'name'
  | 'timeframe'
  | 'ma_type'
  | 'short_ma'
  | 'long_ma'
  | 'adx_period'
  | 'adx_threshold'
  | 'leverage';

export type TrendFollowingTableSortOrder = 'ascend' | 'descend';

export interface TrendFollowingTablePagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showTotal?: (total: number) => ReactNode;
}

export interface TrendFollowingTableSort {
  sortBy: TrendFollowingTableSortField | undefined;
  sortOrder: TrendFollowingTableSortOrder | undefined;
  onChange: (sortBy: TrendFollowingTableSortField | undefined, sortOrder: TrendFollowingTableSortOrder | undefined) => void;
}

/** Column title overrides; keys match column dataIndex/key. */
export interface TrendFollowingTableColumnTitles {
  name?: string;
  timeframe?: string;
  ma_type?: string;
  short_ma?: string;
  long_ma?: string;
  adx_period?: string;
  adx_threshold?: string;
  stop_loss?: string;
  take_profit?: string;
  leverage?: string;
  actions?: string;
  candles?: string;
}

/** Search input above the table (controlled by parent). */
export interface TrendFollowingTableSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Toolbar: e.g. "Clear sort" button. Shown when sort is active and onClearSort is provided. */
export interface TrendFollowingTableToolbar {
  clearSortLabel?: string;
  onClearSort: () => void;
}

/** Row selection (checkboxes). When provided, a checkbox column is shown. */
export interface TrendFollowingTableSelection {
  selectedRowKeys: Key[];
  onChange: (selectedRowKeys: Key[], selectedRows: TrendFollowingStrategyTableRow[]) => void;
  /** Optional: disable checkbox for specific row (e.g. getCheckboxProps(record) => ({ disabled: ... })). */
  getCheckboxProps?: (record: TrendFollowingStrategyTableRow) => { disabled?: boolean };
}
