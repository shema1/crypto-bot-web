import type { Key, ReactNode } from 'react';

/** Row shape for HistoricPairsDataTable (compatible with HistoricPairMetaItem). */
export interface HistoricPairsDataTableRow {
  id: string;
  symbol?: string;
  interval?: string;
  totalCandles?: number;
  oldestRecordDate?: string;
  newestRecordDate?: string;
  pairStatus?: string;
  provider?: string;
}

/** Sort field for table columns (matches API META_SORT_FIELDS). */
export type HistoricPairsDataTableSortField =
  | 'symbol'
  | 'interval'
  | 'totalCandles'
  | 'oldestRecordDate'
  | 'newestRecordDate'
  | 'pairStatus';

export type HistoricPairsDataTableSortOrder = 'ascend' | 'descend';

export interface HistoricPairsDataTablePagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showTotal?: (total: number) => ReactNode;
}

export interface HistoricPairsDataTableSort {
  sortBy: HistoricPairsDataTableSortField | undefined;
  sortOrder: HistoricPairsDataTableSortOrder | undefined;
  onChange: (
    sortBy: HistoricPairsDataTableSortField | undefined,
    sortOrder: HistoricPairsDataTableSortOrder | undefined,
  ) => void;
}

export interface HistoricPairsDataTableColumnTitles {
  symbol?: string;
  interval?: string;
  candles?: string;
  firstRecord?: string;
  lastRecord?: string;
  status?: string;
  actions?: string;
}

export interface HistoricPairsDataTableSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface HistoricPairsDataTableToolbar {
  clearSortLabel?: string;
  onClearSort: () => void;
}

export interface HistoricPairsDataTableSelection {
  selectedRowKeys: Key[];
  onChange: (selectedRowKeys: Key[], selectedRows: HistoricPairsDataTableRow[]) => void;
  getCheckboxProps?: (record: HistoricPairsDataTableRow) => { disabled?: boolean };
}
