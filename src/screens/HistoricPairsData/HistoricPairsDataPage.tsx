import { useState, type FC } from "react";
import { Button, message, Space, Table, Tag } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import AppContainer from "../../components/layout/AppContainer";
import "./HistoricPairsDataPage.css";
import type { HistoricPairData, PairStatus } from "./types";
import { getPairStatusLabel } from "./utils";

const pairStatusConfig: Record<PairStatus, { color: string }> = {
    0: { color: "blue" },
    1: { color: "green" },
    2: { color: "red" },
};

const HistoricPairsDataPage: FC = () => {
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
            title: "Symbol",
            dataIndex: "symbol",
            key: "symbol",
            width: 120,
            sorter: (a, b) => (a.symbol ?? "").localeCompare(b.symbol ?? ""),
        },
        {
            title: "Interval",
            dataIndex: "interval",
            key: "interval",
            width: 80,
            sorter: (a, b) => (a.interval ?? "").localeCompare(b.interval ?? ""),
        },
        {
            title: "Candles",
            dataIndex: "candelsNumber",
            key: "candelsNumber",
            width: 100,
            align: "right",
            sorter: (a, b) => (a.candelsNumber ?? 0) - (b.candelsNumber ?? 0),
        },
        {
            title: "First record",
            dataIndex: "firstRecordDate",
            key: "firstRecordDate",
            width: 120,
            sorter: (a, b) =>
                (a.firstRecordDate ?? "").localeCompare(b.firstRecordDate ?? ""),
        },
        {
            title: "Last record",
            dataIndex: "lastRecordDate",
            key: "lastRecordDate",
            width: 120,
            sorter: (a, b) =>
                (a.lastRecordDate ?? "").localeCompare(b.lastRecordDate ?? ""),
        },
        {
            title: "Status",
            dataIndex: "pairStatus",
            key: "pairStatus",
            width: 100,
            sorter: (a, b) => (a.pairStatus ?? 0) - (b.pairStatus ?? 0),
            render: (status: PairStatus) => (
                <Tag color={pairStatusConfig[status]?.color ?? "default"}>
                    {getPairStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: "Actions",
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
                        Edit
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<SyncOutlined />}
                        onClick={() => handleUpdate(record)}
                    >
                        Update
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record: HistoricPairData) => {
        message.info(`Edit: ${record.symbol} / ${record.interval}`);
        // TODO: open edit modal or navigate to edit form
    };

    const handleUpdate = (record: HistoricPairData) => {
        message.info(`Update/sync: ${record.symbol} / ${record.interval}`);
        // TODO: trigger sync/refresh for this pair
    };

    const handleDelete = (record: HistoricPairData) => {
        setHistoricPairsData((prev) =>
            prev.filter(
                (row) =>
                    !(row.symbol === record.symbol && row.interval === record.interval)
            )
        );
        message.success("Row deleted");
    };

    return (
        <AppContainer>
            <div className="historic-pairs-data-page">
                <h1 className="historic-pairs-data-page__title">
                    Historic Pairs Data
                </h1>
                <Table<HistoricPairData>
                    columns={columns}
                    dataSource={historicPairsData}
                    rowKey={(row) => `${row.symbol}-${row.interval}`}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </div>
        </AppContainer>
    );
};

export default HistoricPairsDataPage;