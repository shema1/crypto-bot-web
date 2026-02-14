import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, message, Space, Table, Tag } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import AppContainer from "../../components/layout/AppContainer";
import "./HistoricPairsDataPage.css";
import AppHeaderContainer from "../../components/layout/AppHeaderContainer";
import AddNewPairsModal from "./components/AddNewPairsModal";
import EditPairDateRangeModal from "./components/EditPairDateRangeModal";
import type { HistoricPairMetaItem, AddHistoricPairDataItem, PairStatus } from "../../modules/historicPairsMeta/types";
import { getPairStatusLabel } from "../../modules/historicPairsMeta/utils";
import { useGetMetaQuery, useDeleteMetaMutation } from "../../modules/historicPairsMeta/apis";

const pairStatusConfig: Record<PairStatus, { color: string }> = {
    syncing: { color: "blue" },
    synced: { color: "green" },
    error: { color: "red" },
};

const pairStatusOrder: Record<PairStatus, number> = {
    syncing: 0,
    synced: 1,
    error: 2,
};

const DEFAULT_PAGE_SIZE = 10;

const HistoricPairsDataPage: FC = () => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
    const [openAddNewPairsModal, setOpenAddNewPairsModal] = useState(false);
    const [selectedPairData, setSelectedPairData] = useState<AddHistoricPairDataItem | null>(null);

    const { data, isLoading, isError, error } = useGetMetaQuery({ page, limit });
    const errorMessage = isError && error && "message" in error ? String(error.message) : null;
    const [deleteMeta, { isLoading: isDeleting }] = useDeleteMetaMutation();

    const historicPairsData = data?.items ?? [];
    const total = data?.total ?? 0;

    const columns: ColumnsType<HistoricPairMetaItem> = [
        {
            title: t("historicPairsData.columns.symbol"),
            dataIndex: "symbol",
            key: "symbol",
            width: 120,
            sorter: (a, b) => (a.symbol ?? "").localeCompare(b.symbol ?? ""),
        },
        {
            title: t("historicPairsData.columns.interval"),
            dataIndex: "interval",
            key: "interval",
            width: 80,
            sorter: (a, b) => (a.interval ?? "").localeCompare(b.interval ?? ""),
        },
        {
            title: t("historicPairsData.columns.candles"),
            dataIndex: "totalCandles",
            key: "totalCandles",
            width: 100,
            align: "right",
            sorter: (a, b) => (a.totalCandles ?? 0) - (b.totalCandles ?? 0),
        },
        {
            title: t("historicPairsData.columns.firstRecord"),
            dataIndex: "firstRecordDate",
            key: "firstRecordDate",
            width: 120,
            sorter: (a, b) =>
                (a.firstRecordDate ?? "").localeCompare(b.firstRecordDate ?? ""),
        },
        {
            title: t("historicPairsData.columns.lastRecord"),
            dataIndex: "lastRecordDate",
            key: "lastRecordDate",
            width: 120,
            sorter: (a, b) =>
                (a.lastRecordDate ?? "").localeCompare(b.lastRecordDate ?? ""),
        },
        {
            title: t("historicPairsData.columns.status"),
            dataIndex: "pairStatus",
            key: "pairStatus",
            width: 100,
            sorter: (a, b) => (pairStatusOrder[a.pairStatus] ?? 0) - (pairStatusOrder[b.pairStatus] ?? 0),
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
        setSelectedPairData({
            symbol: record.symbol,
            interval: record.interval,
            startDateTime: record.firstRecordDate,
            endDateTime: record.lastRecordDate,
            provider: record.provider,
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

    const handleTableChange = (newPage: number, newLimit: number) => {
        setPage(newPage);
        if (newLimit !== limit) {
            setLimit(newLimit);
            setPage(1);
        }
    };

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
                    <Table<HistoricPairMetaItem>
                        columns={columns}
                        dataSource={historicPairsData}
                        rowKey="id"
                        loading={isLoading || isDeleting}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total,
                            showSizeChanger: true,
                            showTotal: (totalCount) => t("common.paginationTotal", { total: totalCount }),
                            onChange: handleTableChange,
                        }}
                        size="middle"
                    />
                </div>
            </AppContainer>
            <AddNewPairsModal open={openAddNewPairsModal} onClose={() => setOpenAddNewPairsModal(false)} />
            <EditPairDateRangeModal open={!!selectedPairData} onClose={() => setSelectedPairData(null)} pairData={selectedPairData} />
        </>
    );
};

export default HistoricPairsDataPage;