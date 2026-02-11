import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, message, Space, Table, Tag } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import AppContainer from "../../components/layout/AppContainer";
import "./HistoricPairsDataPage.css";
import type { HistoricPairData, PairStatus } from "./types";
import { getPairStatusLabel } from "./utils";
import AppHeaderContainer from "../../components/layout/AppHeaderContainer";

const pairStatusConfig: Record<PairStatus, { color: string }> = {
    0: { color: "blue" },
    1: { color: "green" },
    2: { color: "red" },
};

const HistoricPairsDataPage: FC = () => {
    const { t } = useTranslation();
    const [historicPairsData, setHistoricPairsData] = useState<HistoricPairData[]>([
        {
            symbol: "BTCUSDT",
            interval: "1h",
            candelsNumber: 100,
            firstRecordDate: "2021-01-01",
            lastRecordDate: "2021-01-01",
            pairStatus: 0,
        },
        {
            symbol: "ETHUSDT",
            interval: "1h",
            candelsNumber: 100,
            firstRecordDate: "2021-01-01",
            lastRecordDate: "2021-01-01",
            pairStatus: 1,
        },
        {
            symbol: "ETHUSDT",
            interval: "30m",
            candelsNumber: 100,
            firstRecordDate: "2022-01-01",
            lastRecordDate: "2022-01-01",
            pairStatus: 2,
        },
    ]);

    const columns: ColumnsType<HistoricPairData> = [
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
            dataIndex: "candelsNumber",
            key: "candelsNumber",
            width: 100,
            align: "right",
            sorter: (a, b) => (a.candelsNumber ?? 0) - (b.candelsNumber ?? 0),
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
            sorter: (a, b) => (a.pairStatus ?? 0) - (b.pairStatus ?? 0),
            render: (status: PairStatus) => (
                <Tag color={pairStatusConfig[status]?.color ?? "default"}>
                    {t(`pairStatus.${getPairStatusLabel(status)}`)}
                </Tag>
            ),
        },
        {
            title: t("historicPairsData.columns.actions"),
            key: "actions",
            width: 160,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        {t("historicPairsData.actions.edit")}
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<SyncOutlined />}
                        onClick={() => handleUpdate(record)}
                    >
                        {t("historicPairsData.actions.update")}
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        {t("historicPairsData.actions.delete")}
                    </Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record: HistoricPairData) => {
        message.info(t("historicPairsData.messages.editInfo", { symbol: record.symbol, interval: record.interval }));
        // TODO: open edit modal or navigate to edit form
    };

    const handleUpdate = (record: HistoricPairData) => {
        message.info(t("historicPairsData.messages.updateInfo", { symbol: record.symbol, interval: record.interval }));
        // TODO: trigger sync/refresh for this pair
    };

    const handleDelete = (record: HistoricPairData) => {
        setHistoricPairsData((prev) =>
            prev.filter(
                (row) =>
                    !(row.symbol === record.symbol && row.interval === record.interval)
            )
        );
        message.success(t("historicPairsData.messages.rowDeleted"));
    };

    return (
        <>
            <AppHeaderContainer>
                <div className="historic-header-container">
                    <h1 className="historic-pairs-data-page__title">
                        {t("historicPairsData.title")}
                    </h1>
                    <Button type="primary" icon={<PlusOutlined />}>{t("historicPairsData.actions.add")}</Button>
                </div>
            </AppHeaderContainer>
            <AppContainer>
                <div className="historic-pairs-data-page">
                    <Table<HistoricPairData>
                        columns={columns}
                        dataSource={historicPairsData}
                        rowKey={(row) => `${row.symbol}-${row.interval}`}
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                </div>
            </AppContainer>
        </>
    );
};

export default HistoricPairsDataPage;