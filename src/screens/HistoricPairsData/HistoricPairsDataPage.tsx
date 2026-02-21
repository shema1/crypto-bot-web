import { useState, useCallback, useMemo, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, message, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AppContainer from "../../components/layout/AppContainer";
import AppHeaderContainer from "../../components/layout/AppHeaderContainer";
import { HistoricPairsDataTable } from "../../components/core";
import type { HistoricPairsDataTableSortField, HistoricPairsDataTableSortOrder } from "../../components/core";
import type { HistoricPairsDataTableRow } from "../../components/core";
import "./HistoricPairsDataPage.css";
import AddNewPairsModal from "./components/AddNewPairsModal";
import EditPairDateRangeModal from "./components/EditPairDateRangeModal";
import type {
  HistoricPairMetaItem,
  AddHistoricPairDataItem,
  PairStatus,
  MetaSortField,
  SortOrder,
} from "../../modules/historicPairsMeta/types";
import { getPairStatusLabel } from "../../modules/historicPairsMeta/utils";
import { useGetMetaQuery, useDeleteMetaMutation } from "../../modules/historicPairsMeta/apis";

/** Maps table sort field to API sortBy (1:1 with backend META_SORT_FIELDS). */
const TABLE_SORT_TO_API: Record<HistoricPairsDataTableSortField, MetaSortField> = {
  symbol: "symbol",
  interval: "interval",
  totalCandles: "totalCandles",
  oldestRecordDate: "oldestRecordDate",
  newestRecordDate: "newestRecordDate",
  pairStatus: "pairStatus",
};

const API_SORT_TO_TABLE: Record<MetaSortField, HistoricPairsDataTableSortField | undefined> = {
  symbol: "symbol",
  interval: "interval",
  totalCandles: "totalCandles",
  oldestRecordDate: "oldestRecordDate",
  newestRecordDate: "newestRecordDate",
  pairStatus: "pairStatus",
  provider: undefined,
  updatedAt: undefined,
};

const pairStatusConfig: Record<PairStatus, { color: string }> = {
  syncing: { color: "blue" },
  synced: { color: "green" },
  error: { color: "red" },
};

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_SORT_FIELD: MetaSortField = "updatedAt";
const DEFAULT_SORT_ORDER: SortOrder = "desc";

const HistoricPairsDataPage: FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<MetaSortField>(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  const [openAddNewPairsModal, setOpenAddNewPairsModal] = useState(false);
  const [selectedPairForEdit, setSelectedPairForEdit] = useState<{ id: string; data: AddHistoricPairDataItem } | null>(null);

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
      sortBy,
      sortOrder,
    }),
    [page, limit, search, sortBy, sortOrder],
  );
  const { data, isLoading, isError, error } = useGetMetaQuery(queryParams);
  const errorMessage = isError && error && "message" in error ? String(error.message) : null;
  const [deleteMeta, { isLoading: isDeleting }] = useDeleteMetaMutation();

  const historicPairsData = data?.items ?? [];
  const total = data?.total ?? 0;

  const columnTitles = useMemo(
    () => ({
      symbol: t("historicPairsData.columns.symbol"),
      interval: t("historicPairsData.columns.interval"),
      candles: t("historicPairsData.columns.candles"),
      firstRecord: t("historicPairsData.columns.firstRecord"),
      lastRecord: t("historicPairsData.columns.lastRecord"),
      status: t("historicPairsData.columns.status"),
      actions: t("historicPairsData.columns.actions"),
    }),
    [t],
  );

  const handleEdit = useCallback((record: HistoricPairsDataTableRow) => {
    setSelectedPairForEdit({
      id: record.id,
      data: {
        symbol: record.symbol ?? "",
        interval: record.interval ?? "",
        startDateTime: record.oldestRecordDate ?? "",
        endDateTime: record.newestRecordDate ?? "",
        provider: (record.provider as AddHistoricPairDataItem["provider"]) ?? "bybit",
      },
    });
  }, []);

  const handleDelete = useCallback(
    async (record: HistoricPairMetaItem) => {
      try {
        await deleteMeta(record.id).unwrap();
        message.success(t("historicPairsData.messages.rowDeleted"));
      } catch {
        message.error(t("historicPairsData.messages.deleteError"));
      }
    },
    [deleteMeta, t],
  );

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  }, [limit]);

  const tableSortBy: HistoricPairsDataTableSortField | undefined = API_SORT_TO_TABLE[sortBy];
  const tableSortOrder: HistoricPairsDataTableSortOrder | undefined =
    tableSortBy == null ? undefined : sortOrder === "asc" ? "ascend" : "descend";

  const handleSortChange = useCallback(
    (newSortBy: HistoricPairsDataTableSortField | undefined, newSortOrder: HistoricPairsDataTableSortOrder | undefined) => {
      if (newSortBy == null || newSortOrder == null) {
        setSortBy(DEFAULT_SORT_FIELD);
        setSortOrder(DEFAULT_SORT_ORDER);
      } else {
        const apiField = TABLE_SORT_TO_API[newSortBy];
        if (apiField) {
          setSortBy(apiField);
          setSortOrder(newSortOrder === "ascend" ? "asc" : "desc");
        }
      }
      setPage(1);
    },
    [],
  );

  const handleClearSort = useCallback(() => {
    setSortBy(DEFAULT_SORT_FIELD);
    setSortOrder(DEFAULT_SORT_ORDER);
    setPage(1);
  }, []);

  const renderStatus = useCallback(
    (record: HistoricPairsDataTableRow) => {
      const status = record.pairStatus as PairStatus | undefined;
      if (!status) return "—";
      return (
        <Tag color={pairStatusConfig[status]?.color ?? "default"}>
          {t(`pairStatus.${getPairStatusLabel(status)}`)}
        </Tag>
      );
    },
    [t],
  );

  const dataSource: HistoricPairsDataTableRow[] = useMemo(
    () =>
      historicPairsData.map((item) => ({
        id: item.id,
        symbol: item.symbol,
        interval: item.interval,
        totalCandles: item.totalCandles,
        oldestRecordDate: item.oldestRecordDate,
        newestRecordDate: item.newestRecordDate,
        pairStatus: item.pairStatus,
        provider: item.provider,
      })),
    [historicPairsData],
  );

  return (
    <>
      <AppHeaderContainer>
        <div className="historic-header-container">
          <h1 className="historic-pairs-data-page__title">{t("historicPairsData.title")}</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenAddNewPairsModal(true)}>
            {t("historicPairsData.actions.add")}
          </Button>
        </div>
      </AppHeaderContainer>
      <AppContainer>
        <div className="historic-pairs-data-page">
          {errorMessage && (
            <Alert type="error" message={errorMessage} showIcon className="historic-pairs-data-page__error" />
          )}
          <HistoricPairsDataTable
            dataSource={dataSource}
            loading={isLoading || isDeleting}
            columnTitles={columnTitles}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              onChange: handlePaginationChange,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (totalCount) => t("common.paginationTotal", { total: totalCount }),
            }}
            sort={{
              sortBy: tableSortBy ?? undefined,
              sortOrder: tableSortOrder,
              onChange: handleSortChange,
            }}
            search={{
              value: searchInput,
              onChange: setSearchInput,
              placeholder: t("historicPairsData.searchPlaceholder"),
            }}
            toolbar={{
              clearSortLabel: t("historicPairsData.actions.clearSort"),
              onClearSort: handleClearSort,
            }}
            onEdit={handleEdit}
            onDelete={(record) => handleDelete(record as HistoricPairMetaItem)}
            renderStatus={renderStatus}
          />
        </div>
      </AppContainer>
      <AddNewPairsModal open={openAddNewPairsModal} onClose={() => setOpenAddNewPairsModal(false)} />
      <EditPairDateRangeModal
        open={!!selectedPairForEdit}
        onClose={() => setSelectedPairForEdit(null)}
        metaId={selectedPairForEdit?.id ?? ""}
        pairData={selectedPairForEdit?.data ?? null}
      />
    </>
  );
};

export default HistoricPairsDataPage;
