import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Input, message, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import { AddBacktestModal } from './components';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  type BacktestTask,
  type BacktestTaskStatus,
} from '../../modules/backtest';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const taskStatusConfig: Record<BacktestTaskStatus, { color: string }> = {
  created: { color: 'default' },
  running: { color: 'processing' },
  completed: { color: 'success' },
  failed: { color: 'error' },
};

const BacktestPage: FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetTasksQuery({
    search: search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page,
    limit,
  });
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const errorMessage = isError && error && 'message' in error ? String(error.message) : null;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: ColumnsType<BacktestTask> = [
    {
      title: t('backtest.tasks.columns.name'),
      dataIndex: 'name',
      key: 'name',
      width: 220,
      ellipsis: true,
      sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
    },
    {
      title: t('backtest.tasks.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: BacktestTaskStatus) => (
        <Tag color={taskStatusConfig[status]?.color ?? 'default'}>
          {t(`backtest.tasks.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('backtest.tasks.columns.totalIterations'),
      dataIndex: 'totalIterations',
      key: 'totalIterations',
      width: 100,
      align: 'right',
    },
    {
      title: t('backtest.tasks.columns.completedIterations'),
      dataIndex: 'completedIterations',
      key: 'completedIterations',
      width: 110,
      align: 'right',
    },
    {
      title: t('backtest.tasks.columns.failedIterations'),
      dataIndex: 'failedIterations',
      key: 'failedIterations',
      width: 100,
      align: 'right',
    },
    {
      title: t('backtest.tasks.columns.stopLoss'),
      dataIndex: 'stopLoss',
      key: 'stopLoss',
      width: 100,
      align: 'right',
      render: (v: number) => (v != null ? `${v}%` : '—'),
    },
    {
      title: t('backtest.tasks.columns.takeProfit'),
      dataIndex: 'takeProfit',
      key: 'takeProfit',
      width: 110,
      align: 'right',
      render: (v: number) => (v != null ? `${v}%` : '—'),
    },
    {
      title: t('backtest.tasks.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) =>
        value ? format(new Date(value), 'dd/MM/yyyy HH:mm:ss') : '—',
      sorter: (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
    },
  ];

  const handleTableChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  };

  const handleAddTask = async (name: string) => {
    try {
      await createTask({ name }).unwrap();
      message.success(t('backtest.messages.taskCreated'));
      setAddModalOpen(false);
    } catch {
      message.error(t('backtest.messages.createError'));
    }
  };

  return (
    <>
      <AppHeaderContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="backtest-page__title">{t('backtest.title')}</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
            loading={isCreating}
          >
            {t('backtest.actions.add')}
          </Button>
        </div>
      </AppHeaderContainer>
      <AppContainer>
        <div className="backtest-page">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              className="backtest-page__error"
            />
          )}
          <div style={{ marginBottom: 12 }}>
            <Input.Search
              allowClear
              placeholder={t('backtest.tasks.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              style={{ maxWidth: 320 }}
            />
          </div>
          <Table<BacktestTask>
            columns={columns}
            dataSource={items}
            rowKey="_id"
            loading={isLoading || isCreating}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (totalCount) => t('common.paginationTotal', { total: totalCount }),
              onChange: handleTableChange,
            }}
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </AppContainer>
      <AddBacktestModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddTask}
      />
    </>
  );
};

export default BacktestPage;
