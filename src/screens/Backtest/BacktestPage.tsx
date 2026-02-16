import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Table } from 'antd';
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import AppContainer from '../../components/layout/AppContainer';
import AppHeaderContainer from '../../components/layout/AppHeaderContainer';
import { AddBacktestModal } from './components';
import { useGetRunsQuery } from '../../modules/backtest';
import type { BacktestRunListItem } from '../../modules/backtest';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const BacktestPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetRunsQuery({ page, limit });
  const errorMessage = isError && error && 'message' in error ? String(error.message) : null;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: ColumnsType<BacktestRunListItem> = [
    {
      title: t('backtest.columns.id'),
      dataIndex: 'id',
      key: 'id',
      width: 280,
      ellipsis: true,
      render: (id: string) => (
        <a
          href={`/backtest/${id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/backtest/${id}`);
          }}
        >
          {id} <RightOutlined />
        </a>
      ),
    },
    {
      title: t('backtest.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) =>
        value ? format(new Date(value), 'dd/MM/yyyy HH:mm:ss') : '—',
      sorter: (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
    },
    {
      title: t('backtest.columns.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (value: string) =>
        value ? format(new Date(value), 'dd/MM/yyyy HH:mm:ss') : '—',
      sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
    },
    {
      title: t('backtest.columns.resultsCount'),
      dataIndex: 'resultsCount',
      key: 'resultsCount',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.resultsCount ?? 0) - (b.resultsCount ?? 0),
    },
    {
      title: t('backtest.columns.errorsCount'),
      dataIndex: 'errorsCount',
      key: 'errorsCount',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.errorsCount ?? 0) - (b.errorsCount ?? 0),
    },
  ];

  const handleTableChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  };

  return (
    <>
      <AppHeaderContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="backtest-page__title">{t('backtest.title')}</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>{t('backtest.actions.add')}</Button>
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
          <Table<BacktestRunListItem>
            columns={columns}
            dataSource={items}
            rowKey="id"
            loading={isLoading}
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
        onSave={(_name) => {
          // TODO: use _name when creating backtest run (e.g. pass to API or navigate)
          setAddModalOpen(false);
        }}
      />
    </>
  );
};

export default BacktestPage;
