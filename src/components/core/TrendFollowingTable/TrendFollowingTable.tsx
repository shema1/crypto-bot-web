import { useCallback, useMemo, type FC, type ReactNode } from 'react';
import { Button, Input, Space, Table } from 'antd';
import { ClearOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type {
  TrendFollowingStrategyTableRow,
  TrendFollowingTableColumnTitles,
  TrendFollowingTablePagination,
  TrendFollowingTableSort,
  TrendFollowingTableSortField,
  TrendFollowingTableSearch,
  TrendFollowingTableToolbar,
  TrendFollowingTableSelection,
} from './types';
import './TrendFollowingTable.css';

const DEFAULT_COLUMN_TITLES: Required<TrendFollowingTableColumnTitles> = {
  name: 'Name',
  timeframe: 'Timeframe',
  ma_type: 'MA type',
  short_ma: 'Short MA',
  long_ma: 'Long MA',
  adx_period: 'ADX period',
  adx_threshold: 'ADX threshold',
  stop_loss: 'Stop loss',
  take_profit: 'Take profit',
  leverage: 'Leverage',
  actions: 'Actions',
};

const SORTABLE_FIELDS: TrendFollowingTableSortField[] = [
  'name',
  'timeframe',
  'ma_type',
  'short_ma',
  'long_ma',
  'adx_period',
  'adx_threshold',
  'leverage',
];

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface TrendFollowingTableProps {
  dataSource: TrendFollowingStrategyTableRow[];
  loading?: boolean;
  columnTitles?: Partial<TrendFollowingTableColumnTitles>;
  /** When provided, table shows pagination. When omitted, all items are shown without pagination. */
  pagination?: TrendFollowingTablePagination;
  sort?: TrendFollowingTableSort;
  /** Search input above the table (controlled). */
  search?: TrendFollowingTableSearch;
  /** Toolbar: e.g. "Clear sort" button when sort is active. */
  toolbar?: TrendFollowingTableToolbar;
  onDelete?: (record: TrendFollowingStrategyTableRow) => void;
  renderActions?: (record: TrendFollowingStrategyTableRow) => ReactNode;
  rowKey?: keyof TrendFollowingStrategyTableRow;
  /** Hide columns by key (e.g. ['timeframe', 'stop_loss', 'take_profit']). */
  hiddenColumns?: (keyof TrendFollowingStrategyTableRow)[];
  /** Optional row selection (checkboxes). When provided, a checkbox column is shown. */
  selection?: TrendFollowingTableSelection;
}

const TrendFollowingTable: FC<TrendFollowingTableProps> = ({
  dataSource,
  loading = false,
  columnTitles = {},
  pagination,
  sort,
  search,
  toolbar,
  onDelete,
  renderActions,
  rowKey = 'id',
  hiddenColumns = [],
  selection,
}) => {
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
      sorter: SorterResult<TrendFollowingStrategyTableRow> | SorterResult<TrendFollowingStrategyTableRow>[],
    ) => {
      const single = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!sort?.onChange || !single?.columnKey) return;
      const key = single.columnKey as TrendFollowingTableSortField;
      const order = single.order;
      if (SORTABLE_FIELDS.includes(key) && (order === 'ascend' || order === 'descend')) {
        sort.onChange(key, order);
      } else {
        sort.onChange(undefined, undefined);
      }
    },
    [sort],
  );

  const hide = (key: keyof TrendFollowingStrategyTableRow) => hiddenColumns.includes(key);

  const baseColumns: ColumnsType<TrendFollowingStrategyTableRow> = [
    {
      title: titles.name,
      dataIndex: 'name',
      key: 'name',
      width: 140,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder('name'),
    },
    ...(!hide('timeframe')
      ? [
          {
            title: titles.timeframe,
            dataIndex: 'timeframe',
            key: 'timeframe',
            width: 100,
            sorter: true,
            sortOrder: getSortOrder('timeframe'),
          },
        ]
      : []),
    {
      title: titles.ma_type,
      dataIndex: 'ma_type',
      key: 'ma_type',
      width: 90,
      sorter: true,
      sortOrder: getSortOrder('ma_type'),
    },
    {
      title: titles.short_ma,
      dataIndex: 'short_ma',
      key: 'short_ma',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: getSortOrder('short_ma'),
    },
    {
      title: titles.long_ma,
      dataIndex: 'long_ma',
      key: 'long_ma',
      width: 100,
      align: 'right',
      sorter: true,
      sortOrder: getSortOrder('long_ma'),
    },
    {
      title: titles.adx_period,
      dataIndex: 'adx_period',
      key: 'adx_period',
      width: 110,
      align: 'right',
      sorter: true,
      sortOrder: getSortOrder('adx_period'),
    },
    {
      title: titles.adx_threshold,
      dataIndex: 'adx_threshold',
      key: 'adx_threshold',
      width: 120,
      align: 'right',
      sorter: true,
      sortOrder: getSortOrder('adx_threshold'),
    },
    {
      title: titles.leverage,
      dataIndex: 'leverage',
      key: 'leverage',
      width: 90,
      align: 'right',
      sorter: true,
      sortOrder: getSortOrder('leverage'),
    },
  ];

  const hasActions = renderActions != null || onDelete != null;
  const columns: ColumnsType<TrendFollowingStrategyTableRow> = [
    ...baseColumns,
    ...(hasActions
      ? [
          {
            title: titles.actions,
            key: 'actions',
            width: 80,
            fixed: 'right' as const,
            render: (_: unknown, record: TrendFollowingStrategyTableRow) =>
              renderActions ? (
                renderActions(record)
              ) : onDelete ? (
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(record)}
                  />
                </Space>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <div className="trend-following-table">
      {(search != null || showClearSort) && (
        <div className="trend-following-table__toolbar">
          {search != null && (
            <Input
              prefix={<SearchOutlined />}
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              allowClear
              className="trend-following-table__search"
              style={{ maxWidth: 400 }}
            />
          )}
          {showClearSort && toolbar && (
            <Button
              icon={<ClearOutlined />}
              onClick={toolbar.onClearSort}
            >
              {toolbar.clearSortLabel ?? 'Clear sort'}
            </Button>
          )}
        </div>
      )}
      <Table<TrendFollowingStrategyTableRow>
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

export default TrendFollowingTable;
