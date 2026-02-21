import { useState, useCallback, useMemo, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, message, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import AppContainer from '../../../components/layout/AppContainer';
import AppHeaderContainer from '../../../components/layout/AppHeaderContainer';
import { BreakoutStrategyTable } from '../../../components/core';
import type {
  BreakoutStrategyTableSortField,
  BreakoutStrategyTableSortOrder,
} from '../../../components/core';
import type { BreakoutStrategyTableRow } from '../../../components/core';
import { BreakoutStrategyFormModal } from './components';
import type { BreakoutStrategyFormValues } from './components';
import './BreakoutStrategyPage.css';
import {
  useGetBreakoutStrategiesQuery,
  useDeleteBreakoutStrategyMutation,
  useCreateBreakoutStrategyMutation,
  useUpdateBreakoutStrategyMutation,
} from '../../../modules/strategies/breakoutStrategy';
import type {
  BreakoutStrategyItem,
  BreakoutStrategySortField,
  BreakoutStrategySortOrder,
} from '../../../modules/strategies/breakoutStrategy';
import { BREAKOUT_STRATEGY_LIST_DEFAULTS } from '../../../modules/strategies/breakoutStrategy';

const DEFAULT_PAGE_SIZE = BREAKOUT_STRATEGY_LIST_DEFAULTS.limit;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const BreakoutStrategyPage: FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<BreakoutStrategySortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<BreakoutStrategySortOrder>('asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() && { search: search.trim() }),
      ...(sortBy != null && { sortBy, sortOrder }),
    }),
    [page, limit, search, sortBy, sortOrder],
  );
  const { data, isLoading, isError, error } = useGetBreakoutStrategiesQuery(queryParams);
  const errorMessage = isError && error && 'message' in error ? String(error.message) : null;
  const [deleteStrategy, { isLoading: isDeleting }] = useDeleteBreakoutStrategyMutation();
  const [createStrategy, { isLoading: isCreating }] = useCreateBreakoutStrategyMutation();
  const [updateStrategy, { isLoading: isUpdating }] = useUpdateBreakoutStrategyMutation();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BreakoutStrategyItem | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const isFormSubmitting = isCreating || isUpdating;

  const columnTitles = useMemo(
    () => ({
      name: t('strategies.breakout.columns.name'),
      lookback_period: t('strategies.breakout.columns.lookbackPeriod'),
      breakout_buffer: t('strategies.breakout.columns.breakoutBuffer'),
      min_volume_ratio: t('strategies.breakout.columns.minVolumeRatio'),
      leverage: t('strategies.breakout.columns.leverage'),
      actions: t('strategies.breakout.columns.actions'),
    }),
    [t],
  );

  const handleDelete = useCallback(
    async (record: BreakoutStrategyItem) => {
      try {
        await deleteStrategy(record.id).unwrap();
        message.success(t('strategies.breakout.messages.rowDeleted'));
      } catch {
        message.error(t('strategies.breakout.messages.deleteError'));
      }
    },
    [deleteStrategy, t],
  );

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setFormModalOpen(true);
  }, []);

  const openEditModal = useCallback((record: BreakoutStrategyItem) => {
    setEditingItem(record);
    setFormModalOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setFormModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: BreakoutStrategyFormValues) => {
      try {
        if (editingItem) {
          await updateStrategy({ id: editingItem.id, body: values }).unwrap();
          message.success(t('strategies.breakout.messages.rowUpdated'));
        } else {
          await createStrategy(values).unwrap();
          message.success(t('strategies.breakout.messages.rowCreated'));
        }
      } catch {
        message.error(
          editingItem
            ? t('strategies.breakout.messages.updateError')
            : t('strategies.breakout.messages.createError'),
        );
        throw new Error('Submit failed');
      }
    },
    [editingItem, updateStrategy, createStrategy, t],
  );

  const renderActions = useCallback(
    (record: BreakoutStrategyTableRow) => (
      <Space size="small">
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record as BreakoutStrategyItem)}
        />
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record as BreakoutStrategyItem)}
        />
      </Space>
    ),
    [openEditModal, handleDelete],
  );

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  }, [limit]);

  const tableSortOrder: BreakoutStrategyTableSortOrder | undefined =
    sortBy == null ? undefined : sortOrder === 'asc' ? 'ascend' : 'descend';

  const handleSortChange = useCallback(
    (
      newSortBy: BreakoutStrategyTableSortField | undefined,
      newSortOrder: BreakoutStrategyTableSortOrder | undefined,
    ) => {
      if (newSortBy == null || newSortOrder == null) {
        setSortBy(undefined);
        setSortOrder('asc');
      } else {
        setSortBy(newSortBy as BreakoutStrategySortField);
        setSortOrder(newSortOrder === 'ascend' ? 'asc' : 'desc');
      }
      setPage(1);
    },
    [],
  );

  const handleClearSort = useCallback(() => {
    setSortBy(undefined);
    setSortOrder('asc');
    setPage(1);
  }, []);

  return (
    <>
      <AppHeaderContainer>
        <div className="breakout-strategy-page__header">
          <h1 className="breakout-strategy-page__title">
            {t('strategies.breakout.title')}
          </h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            {t('strategies.breakout.actions.add')}
          </Button>
        </div>
      </AppHeaderContainer>
      <AppContainer>
        <div className="breakout-strategy-page">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              className="breakout-strategy-page__error"
            />
          )}
          <BreakoutStrategyTable
            dataSource={items}
            loading={isLoading || isDeleting}
            columnTitles={columnTitles}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              onChange: handlePaginationChange,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (totalCount) => t('common.paginationTotal', { total: totalCount }),
            }}
            sort={{
              sortBy: sortBy ?? undefined,
              sortOrder: tableSortOrder,
              onChange: handleSortChange,
            }}
            search={{
              value: searchInput,
              onChange: setSearchInput,
              placeholder: t('strategies.breakout.searchPlaceholder'),
            }}
            toolbar={{
              clearSortLabel: t('strategies.breakout.actions.clearSort'),
              onClearSort: handleClearSort,
            }}
            renderActions={renderActions}
            onDelete={(record) => handleDelete(record as BreakoutStrategyItem)}
          />
        </div>
      </AppContainer>
      <BreakoutStrategyFormModal
        open={formModalOpen}
        onClose={closeFormModal}
        initialValues={editingItem}
        onSubmit={handleFormSubmit}
        isSubmitting={isFormSubmitting}
      />
    </>
  );
};

export default BreakoutStrategyPage;
