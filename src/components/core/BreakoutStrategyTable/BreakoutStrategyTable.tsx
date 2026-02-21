import { useCallback, useMemo, type FC, type ReactNode } from 'react';
import { Button, Input, Space, Table } from 'antd';
import { ClearOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type {
  BreakoutStrategyTableRow,
  BreakoutStrategyTableColumnTitles,
  BreakoutStrategyTablePagination,
  BreakoutStrategyTableSort,
  BreakoutStrategyTableSortField,
  BreakoutStrategyTableSearch,
  BreakoutStrategyTableToolbar,
  BreakoutStrategyTableSelection,
} from './types';
import './BreakoutStrategyTable.css';

const DEFAULT_COLUMN_TITLES: Required<BreakoutStrategyTableColumnTitles> = {
  name: 'Name',
  lookback_period: 'Lookback period',
  breakout_buffer: 'Breakout buffer',
  min_volume_ratio: 'Min volume ratio',
  leverage: 'Leverage',
  actions: 'Actions',
};

const SORTABLE_FIELDS: BreakoutStrategyTableSortField[] = [
  'name',
  'lookback_period',
  'breakout_buffer',
  'min_volume_ratio',
  'leverage',
];

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface BreakoutStrategyTableProps {
  dataSource: BreakoutStrategyTableRow[];
  loading?: boolean;
  columnTitles?: Partial<BreakoutStrategyTableColumnTitles>;
  /** When provided, table shows pagination. When omitted, all items are shown without pagination. */
  pagination?: BreakoutStrategyTablePagination;
  sort?: BreakoutStrategyTableSort;
  /** Search input above the table (controlled). */
  search?: BreakoutStrategyTableSearch;
  /** Toolbar: e.g. "Clear sort" button when sort is active. */
  toolbar?: BreakoutStrategyTableToolbar;
  onDelete?: (record: BreakoutStrategyTableRow) => void;
  renderActions?: (record: BreakoutStrategyTableRow) => ReactNode;
  rowKey?: keyof BreakoutStrategyTableRow;
  /** Hide columns by key. */
  hiddenColumns?: (keyof BreakoutStrategyTableRow)[];
  /** Optional row selection (checkboxes). */
  selection?: BreakoutStrategyTableSelection;
}

const BreakoutStrategyTable: FC<BreakoutStrategyTableProps> = ({
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
      sorter: SorterResult<BreakoutStrategyTableRow> | SorterResult<BreakoutStrategyTableRow>[],
    ) => {
      const single = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!sort?.onChange || !single?.columnKey) return;
      const key = single.columnKey as BreakoutStrategyTableSortField;
      const order = single.order;
      if (SORTABLE_FIELDS.includes(key) && (order === 'ascend' || order === 'descend')) {
        sort.onChange(key, order);
      } else {
        sort.onChange(undefined, undefined);
      }
    },
    [sort],
  );

  const hide = (key: keyof BreakoutStrategyTableRow) => hiddenColumns.includes(key);

  const baseColumns: ColumnsType<BreakoutStrategyTableRow> = [
    {
      title: titles.name,
      dataIndex: 'name',
      key: 'name',
      width: 140,
      ellipsis: true,
      sorter: true,
      sortOrder: getSortOrder('name'),
    },
    ...(!hide('lookback_period')
      ? [
          {
            title: titles.lookback_period,
            dataIndex: 'lookback_period',
            key: 'lookback_period',
            width: 130,
            align: 'right' as const,
            sorter: true,
            sortOrder: getSortOrder('lookback_period'),
          },
        ]
      : []),
    ...(!hide('breakout_buffer')
      ? [
          {
            title: titles.breakout_buffer,
            dataIndex: 'breakout_buffer',
            key: 'breakout_buffer',
            width: 130,
            align: 'right' as const,
            sorter: true,
            sortOrder: getSortOrder('breakout_buffer'),
          },
        ]
      : []),
    ...(!hide('min_volume_ratio')
      ? [
          {
            title: titles.min_volume_ratio,
            dataIndex: 'min_volume_ratio',
            key: 'min_volume_ratio',
            width: 140,
            align: 'right' as const,
            sorter: true,
            sortOrder: getSortOrder('min_volume_ratio'),
          },
        ]
      : []),
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
  const columns: ColumnsType<BreakoutStrategyTableRow> = [
    ...baseColumns,
    ...(hasActions
      ? [
          {
            title: titles.actions,
            key: 'actions',
            width: 80,
            fixed: 'right' as const,
            render: (_: unknown, record: BreakoutStrategyTableRow) =>
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
    <div className="breakout-strategy-table">
      {(search != null || showClearSort) && (
        <div className="breakout-strategy-table__toolbar">
          {search != null && (
            <Input
              prefix={<SearchOutlined />}
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              allowClear
              className="breakout-strategy-table__search"
              style={{ maxWidth: 400 }}
            />
          )}
          {showClearSort && toolbar && (
            <Button icon={<ClearOutlined />} onClick={toolbar.onClearSort}>
              {toolbar.clearSortLabel ?? 'Clear sort'}
            </Button>
          )}
        </div>
      )}
      <Table<BreakoutStrategyTableRow>
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

export default BreakoutStrategyTable;
