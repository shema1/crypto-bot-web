import { useCallback, useMemo, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Space, Table } from 'antd';
import { ClearOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { format } from 'date-fns';
import type {
  HistoricPairsDataTableRow,
  HistoricPairsDataTableColumnTitles,
  HistoricPairsDataTablePagination,
  HistoricPairsDataTableSort,
  HistoricPairsDataTableSortField,
  HistoricPairsDataTableSearch,
  HistoricPairsDataTableToolbar,
  HistoricPairsDataTableSelection,
} from './types';
import './HistoricPairsDataTable.css';

const DEFAULT_COLUMN_TITLES: Required<HistoricPairsDataTableColumnTitles> = {
  symbol: 'Symbol',
  interval: 'Interval',
  candles: 'Candles',
  firstRecord: 'First record',
  lastRecord: 'Last record',
  status: 'Status',
  actions: 'Actions',
};

const SORTABLE_FIELDS: HistoricPairsDataTableSortField[] = [
  'symbol',
  'interval',
  'totalCandles',
  'oldestRecordDate',
  'newestRecordDate',
  'pairStatus',
];

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : format(d, 'dd/MM/yyyy HH:mm:ss');
  } catch {
    return value;
  }
}

export interface HistoricPairsDataTableProps {
  dataSource: HistoricPairsDataTableRow[];
  loading?: boolean;
  columnTitles?: Partial<HistoricPairsDataTableColumnTitles>;
  pagination?: HistoricPairsDataTablePagination;
  sort?: HistoricPairsDataTableSort;
  search?: HistoricPairsDataTableSearch;
  toolbar?: HistoricPairsDataTableToolbar;
  onEdit?: (record: HistoricPairsDataTableRow) => void;
  onDelete?: (record: HistoricPairsDataTableRow) => void;
  /** Custom status cell (e.g. Tag with translated label). When not provided, raw pairStatus is shown. */
  renderStatus?: (record: HistoricPairsDataTableRow) => ReactNode;
  renderActions?: (record: HistoricPairsDataTableRow) => ReactNode;
  rowKey?: keyof HistoricPairsDataTableRow;
  hiddenColumns?: (keyof HistoricPairsDataTableRow)[];
  selection?: HistoricPairsDataTableSelection;
}

const HistoricPairsDataTable: FC<HistoricPairsDataTableProps> = ({
  dataSource,
  loading = false,
  columnTitles = {},
  pagination,
  sort,
  search,
  toolbar,
  onEdit,
  onDelete,
  renderStatus,
  renderActions,
  rowKey = 'id',
  hiddenColumns = [],
  selection,
}) => {
  const { t } = useTranslation();
  const titles = { ...DEFAULT_COLUMN_TITLES, ...columnTitles };
  const showClearSort = sort != null && sort.sortBy != null && toolbar?.onClearSort != null;

  const tablePagination = useMemo(() => {
    if (pagination == null) return false;
    const pageSizeOptions = pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
    return {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: true,
      pageSizeOptions,
      showTotal: pagination.showTotal,
      onChange: pagination.onChange,
    };
  }, [pagination]);

  const rowSelection = useMemo(
    () =>
      selection
        ? {
            selectedRowKeys: selection.selectedRowKeys,
            onChange: selection.onChange,
            getCheckboxProps: selection.getCheckboxProps,
          }
        : undefined,
    [selection],
  );

  const getSortOrder = useCallback(
    (key: string): 'ascend' | 'descend' | undefined => {
      if (!sort || sort.sortBy !== key) return undefined;
      return sort.sortOrder ?? undefined;
    },
    [sort],
  );

  const handleChange = useCallback(
    (
      _pagination: { current?: number; pageSize?: number },
      _filters: unknown,
      sorter: SorterResult<HistoricPairsDataTableRow> | SorterResult<HistoricPairsDataTableRow>[],
    ) => {
      const single = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!sort?.onChange || !single?.columnKey) return;
      const key = single.columnKey as HistoricPairsDataTableSortField;
      const order = single.order;
      if (SORTABLE_FIELDS.includes(key) && (order === 'ascend' || order === 'descend')) {
        sort.onChange(key, order);
      } else {
        sort.onChange(undefined, undefined);
      }
    },
    [sort],
  );

  const hide = (key: keyof HistoricPairsDataTableRow) => hiddenColumns.includes(key);

  const baseColumns: ColumnsType<HistoricPairsDataTableRow> = [
    ...(!hide('symbol')
      ? [
          {
            title: titles.symbol,
            dataIndex: 'symbol',
            key: 'symbol',
            width: 120,
            sorter: true,
            sortOrder: getSortOrder('symbol'),
          },
        ]
      : []),
    ...(!hide('interval')
      ? [
          {
            title: titles.interval,
            dataIndex: 'interval',
            key: 'interval',
            width: 80,
            sorter: true,
            sortOrder: getSortOrder('interval'),
          },
        ]
      : []),
    ...(!hide('totalCandles')
      ? [
          {
            title: titles.candles,
            dataIndex: 'totalCandles',
            key: 'totalCandles',
            width: 100,
            align: 'right' as const,
            sorter: true,
            sortOrder: getSortOrder('totalCandles'),
          },
        ]
      : []),
    ...(!hide('oldestRecordDate')
      ? [
          {
            title: titles.firstRecord,
            dataIndex: 'oldestRecordDate',
            key: 'oldestRecordDate',
            width: 140,
            render: (value: string | undefined) => formatDateTime(value),
            sorter: true,
            sortOrder: getSortOrder('oldestRecordDate'),
          },
        ]
      : []),
    ...(!hide('newestRecordDate')
      ? [
          {
            title: titles.lastRecord,
            dataIndex: 'newestRecordDate',
            key: 'newestRecordDate',
            width: 140,
            render: (value: string | undefined) => formatDateTime(value),
            sorter: true,
            sortOrder: getSortOrder('newestRecordDate'),
          },
        ]
      : []),
    ...(!hide('pairStatus')
      ? [
          {
            title: titles.status,
            dataIndex: 'pairStatus',
            key: 'pairStatus',
            width: 100,
            sorter: true,
            sortOrder: getSortOrder('pairStatus'),
            render: (_: unknown, record: HistoricPairsDataTableRow) =>
              renderStatus ? renderStatus(record) : (record.pairStatus ?? '—'),
          },
        ]
      : []),
  ];

  const hasActions = renderActions != null || onEdit != null || onDelete != null;
  const columns: ColumnsType<HistoricPairsDataTableRow> = [
    ...baseColumns,
    ...(hasActions
      ? [
          {
            title: titles.actions,
            key: 'actions',
            width: 90,
            fixed: 'right' as const,
            render: (_: unknown, record: HistoricPairsDataTableRow) =>
              renderActions ? (
                renderActions(record)
              ) : (
                <Space size="small">
                  {onEdit && (
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(record)}
                    />
                  )}
                  {onDelete && (
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(record)}
                    />
                  )}
                </Space>
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="historic-pairs-data-table">
      {(search != null || showClearSort) && (
        <div className="historic-pairs-data-table__toolbar">
          {search != null && (
            <Input
              prefix={<SearchOutlined />}
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              allowClear
              className="historic-pairs-data-table__search"
              style={{ maxWidth: 400 }}
            />
          )}
          {showClearSort && toolbar && (
            <Button icon={<ClearOutlined />} onClick={toolbar.onClearSort}>
              {toolbar.clearSortLabel ?? t('common.clearSort')}
            </Button>
          )}
        </div>
      )}
      <Table<HistoricPairsDataTableRow>
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        rowSelection={rowSelection}
        loading={loading}
        onChange={sort ? handleChange : undefined}
        pagination={tablePagination}
        size="middle"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default HistoricPairsDataTable;
