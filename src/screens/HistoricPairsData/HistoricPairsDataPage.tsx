import { useState, useCallback, useMemo, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Input, message, Space, Table, Tag } from "antd";
import { ClearOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import AppContainer from "../../components/layout/AppContainer";
import "./HistoricPairsDataPage.css";
import AppHeaderContainer from "../../components/layout/AppHeaderContainer";
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
import { format } from "date-fns";

/** Maps table column key to API sortBy field (backend uses oldestRecordDate/newestRecordDate) */
const COLUMN_TO_SORT_FIELD: Record<string, MetaSortField> = {
    symbol: "symbol",
    interval: "interval",
    totalCandles: "totalCandles",
    firstRecordDate: "oldestRecordDate",
    lastRecordDate: "newestRecordDate",
    pairStatus: "pairStatus",
};

const pairStatusConfig: Record<PairStatus, { color: string }> = {
    syncing: { color: "blue" },
    synced: { color: "green" },
    error: { color: "red" },
};

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

/** Options for "items per page" dropdown in table pagination */
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);
    const [openAddNewPairsModal, setOpenAddNewPairsModal] = useState(false);
    const [selectedPairForEdit, setSelectedPairForEdit] = useState<{ id: string; data: AddHistoricPairDataItem } | null>(null);

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

    const getColumnSortOrder = useCallback(
        (dataIndex: string): "ascend" | "descend" | undefined => {
            const field = COLUMN_TO_SORT_FIELD[dataIndex];
            if (field !== sortBy) return undefined;
            return sortOrder === "asc" ? "ascend" : "descend";
        },
        [sortBy, sortOrder],
    );

    const columns: ColumnsType<HistoricPairMetaItem> = [
        {
            title: t("historicPairsData.columns.symbol"),
            dataIndex: "symbol",
            key: "symbol",
            width: 120,
            sorter: true,
            sortOrder: getColumnSortOrder("symbol"),
        },
        {
            title: t("historicPairsData.columns.interval"),
            dataIndex: "interval",
            key: "interval",
            width: 80,
            sorter: true,
            sortOrder: getColumnSortOrder("interval"),
        },
        {
            title: t("historicPairsData.columns.candles"),
            dataIndex: "totalCandles",
            key: "totalCandles",
            width: 100,
            align: "right",
            sorter: true,
            sortOrder: getColumnSortOrder("totalCandles"),
        },
        {
            title: t("historicPairsData.columns.firstRecord"),
            dataIndex: "firstRecordDate",
            key: "firstRecordDate",
            width: 120,
            render: (value: string) => (value ? format(new Date(value), "dd/MM/yyyy HH:mm:ss") : "-"),
            sorter: true,
            sortOrder: getColumnSortOrder("firstRecordDate"),
        },
        {
            title: t("historicPairsData.columns.lastRecord"),
            dataIndex: "lastRecordDate",
            key: "lastRecordDate",
            width: 120,
            render: (value: string) => (value ? format(new Date(value), "dd/MM/yyyy HH:mm:ss") : "-"),
            sorter: true,
            sortOrder: getColumnSortOrder("lastRecordDate"),
        },
        {
            title: t("historicPairsData.columns.status"),
            dataIndex: "pairStatus",
            key: "pairStatus",
            width: 100,
            sorter: true,
            sortOrder: getColumnSortOrder("pairStatus"),
            render: (status: PairStatus) => (
                <Tag color={pairStatusConfig[status]?.color ?? "default"}>
                    {t(`pairStatus.${getPairStatusLabel(status)}`)}
                </Tag>
            ),
        },
        {
            title: t("historicPairsData.columns.actions"),
            key: "actions",
            width: 50,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    const handleEdit = (record: HistoricPairMetaItem) => {
        setSelectedPairForEdit({
            id: record.id,
            data: {
                symbol: record.symbol,
                interval: record.interval,
                startDateTime: record.firstRecordDate,
                endDateTime: record.lastRecordDate,
                provider: record.provider,
            },
        });
    };

    const handleDelete = async (record: HistoricPairMetaItem) => {
        try {
            await deleteMeta(record.id).unwrap();
            message.success(t("historicPairsData.messages.rowDeleted"));
        } catch {
            message.error(t("historicPairsData.messages.deleteError"));
        }
    };

    const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
        setPage(newPage);
        if (newPageSize !== limit) {
            setLimit(newPageSize);
            setPage(1);
        }
    }, [limit]);

    const handleTableChange = useCallback(
        (
            _pagination: { current?: number; pageSize?: number },
            _filters: unknown,
            sorter: SorterResult<HistoricPairMetaItem> | SorterResult<HistoricPairMetaItem>[],
        ) => {
            const single = Array.isArray(sorter) ? sorter[0] : sorter;
            if (!single?.columnKey) return;
            const order = single.order;
            if (order === "ascend" || order === "descend") {
                const field = COLUMN_TO_SORT_FIELD[single.columnKey as string];
                if (field) {
                    setSortBy(field);
                    setSortOrder(order === "ascend" ? "asc" : "desc");
                    setPage(1);
                }
            } else {
                setSortBy(DEFAULT_SORT_FIELD);
                setSortOrder(DEFAULT_SORT_ORDER);
                setPage(1);
            }
        },
        [],
    );

    const handleClearSort = useCallback(() => {
        setSortBy(DEFAULT_SORT_FIELD);
        setSortOrder(DEFAULT_SORT_ORDER);
        setPage(1);
    }, []);

    const isSortedByColumn = sortBy !== DEFAULT_SORT_FIELD;

    return (
        <>
            <AppHeaderContainer>
                <div className="historic-header-container">
                    <h1 className="historic-pairs-data-page__title">
                        {t("historicPairsData.title")}
                    </h1>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenAddNewPairsModal(true)}>{t("historicPairsData.actions.add")}</Button>
                </div>
            </AppHeaderContainer>
            <AppContainer>
                <div className="historic-pairs-data-page">
                    {errorMessage && (
                        <Alert type="error" message={errorMessage} showIcon className="historic-pairs-data-page__error" />
                    )}
                    <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder={t("historicPairsData.searchPlaceholder")}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            allowClear
                            className="historic-pairs-data-page__search"
                            style={{ maxWidth: 400 }}
                        />
                        {isSortedByColumn && (
                            <Button icon={<ClearOutlined />} onClick={handleClearSort}>
                                {t("historicPairsData.actions.clearSort")}
                            </Button>
                        )}
                    </div>
                    <Table<HistoricPairMetaItem>
                        columns={columns}
                        dataSource={historicPairsData}
                        rowKey="id"
                        loading={isLoading || isDeleting}
                        onChange={handleTableChange}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total,
                            showSizeChanger: true,
                            pageSizeOptions: PAGE_SIZE_OPTIONS,
                            showTotal: (totalCount) => t("common.paginationTotal", { total: totalCount }),
                            onChange: handlePaginationChange,
                        }}
                        size="middle"
                    />
                </div>
            </AppContainer>
            <AddNewPairsModal open={openAddNewPairsModal} onClose={() => setOpenAddNewPairsModal(false)} />
            <EditPairDateRangeModal open={!!selectedPairForEdit} onClose={() => setSelectedPairForEdit(null)} metaId={selectedPairForEdit?.id ?? ""} pairData={selectedPairForEdit?.data ?? null} />
        </>
    );
};

export default HistoricPairsDataPage;