import type { Key, ReactNode } from 'react';

/** Row shape expected by BreakoutStrategyTable (compatible with BreakoutStrategyItem). */
export interface BreakoutStrategyTableRow {
  id: string;
  name?: string;
  strategy?: string;
  lookback_period?: number;
  breakout_buffer?: number;
  min_volume_ratio?: number;
  leverage?: number;
}

/** Sort field for table columns. */
export type BreakoutStrategyTableSortField =
  | 'name'
  | 'lookback_period'
  | 'breakout_buffer'
  | 'min_volume_ratio'
  | 'leverage';

export type BreakoutStrategyTableSortOrder = 'ascend' | 'descend';

export interface BreakoutStrategyTablePagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showTotal?: (total: number) => ReactNode;
}

export interface BreakoutStrategyTableSort {
  sortBy: BreakoutStrategyTableSortField | undefined;
  sortOrder: BreakoutStrategyTableSortOrder | undefined;
  onChange: (
    sortBy: BreakoutStrategyTableSortField | undefined,
    sortOrder: BreakoutStrategyTableSortOrder | undefined,
  ) => void;
}

/** Column title overrides; keys match column dataIndex/key. */
export interface BreakoutStrategyTableColumnTitles {
  name?: string;
  lookback_period?: string;
  breakout_buffer?: string;
  min_volume_ratio?: string;
  leverage?: string;
  actions?: string;
}

/** Search input above the table (controlled by parent). */
export interface BreakoutStrategyTableSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Toolbar: e.g. "Clear sort" button. Shown when sort is active and onClearSort is provided. */
export interface BreakoutStrategyTableToolbar {
  clearSortLabel?: string;
  onClearSort: () => void;
}

/** Row selection (checkboxes). When provided, a checkbox column is shown. */
export interface BreakoutStrategyTableSelection {
  selectedRowKeys: Key[];
  onChange: (selectedRowKeys: Key[], selectedRows: BreakoutStrategyTableRow[]) => void;
  getCheckboxProps?: (record: BreakoutStrategyTableRow) => { disabled?: boolean };
}
