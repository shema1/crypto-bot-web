import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { DatePicker, Modal, Select } from "../../../../components/core";
import { addDays, subMonths } from "date-fns";
import { Button, message, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { AddHistoricPairDataItem } from "../../../../modules/historicPairsMeta/types";
import { useAddHistoricPairDataMutation } from "../../../../modules/historicPairsMeta/apis";

const PAIRS = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT', 'XLMUSDT'];
const INTERVALS = ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720', 'D', 'W', 'M'];

interface AddNewPairsModalProps {
    open: boolean;
    onClose: () => void;
}

const getInitialPair = (): AddHistoricPairDataItem => ({
    symbol: "BTCUSDT",
    interval: "1h",
    startDateTime: subMonths(new Date(), 1).toISOString(),
    endDateTime: new Date().toISOString(),
    provider: "bybit",
});

const AddNewPairsModal: FC<AddNewPairsModalProps> = ({ open, onClose }) => {
    const [newPairs, setNewPairs] = useState<AddHistoricPairDataItem[]>(() => [getInitialPair()]);
    const [addHistoricPairData, { isLoading: isSubmitting }] = useAddHistoricPairDataMutation();

    useEffect(() => {
        if (open) {
            setNewPairs([getInitialPair()]);
        }
    }, [open]);

    const usedIntervalsBySymbol = useMemo(() => {
        const map: Record<string, Set<string>> = {};
        newPairs.forEach((p) => {
            if (!map[p.symbol]) map[p.symbol] = new Set();
            map[p.symbol].add(p.interval);
        });
        return map;
    }, [newPairs]);

    const pairsOptions = useMemo(() => {
        return PAIRS.map((pair) => {
            const usedCount = usedIntervalsBySymbol[pair]?.size ?? 0;
            return {
                value: pair,
                label: pair,
                disabled: usedCount >= INTERVALS.length,
            };
        });
    }, [usedIntervalsBySymbol]);

    const getIntervalsOptionsForRow = useCallback((symbol: string, excludeIndex: number) => {
        const usedInOtherRows = new Set(
            newPairs
                .filter((p, i) => i !== excludeIndex && p.symbol === symbol)
                .map((p) => p.interval)
        );
        return INTERVALS.filter((interval) => !usedInOtherRows.has(interval))
            .map((interval) => ({ value: interval, label: interval }));
    }, [newPairs]);

    const getFirstAvailableInterval = useCallback((symbol: string, excludeIndex: number) => {
        const usedInOtherRows = new Set(
            newPairs
                .filter((p, i) => i !== excludeIndex && p.symbol === symbol)
                .map((p) => p.interval)
        );
        return INTERVALS.find((interval) => !usedInOtherRows.has(interval)) ?? INTERVALS[0];
    }, [newPairs]);

    const updatePair = useCallback((index: number, updates: Partial<AddHistoricPairDataItem>) => {
        setNewPairs((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    }, []);

    const handleSymbolChange = useCallback((index: number, newSymbol: string) => {
        const firstInterval = getFirstAvailableInterval(newSymbol, index);
        setNewPairs((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                symbol: newSymbol,
                interval: firstInterval,
            };
            return next;
        });
    }, [getFirstAvailableInterval]);

    const handleIntervalChange = useCallback((index: number, newInterval: string) => {
        updatePair(index, { interval: newInterval });
    }, [updatePair]);

    const getNextAvailablePair = useCallback((): { symbol: string; interval: string } => {
        const used = new Set(newPairs.map((p) => `${p.symbol}-${p.interval}`));
        for (const symbol of PAIRS) {
            for (const interval of INTERVALS) {
                if (!used.has(`${symbol}-${interval}`)) {
                    return { symbol, interval };
                }
            }
        }
        return { symbol: PAIRS[0], interval: INTERVALS[0] };
    }, [newPairs]);

    useEffect(() => {
        setNewPairs((prev) => {
            let changed = false;
            const next = prev.map((p, i) => {
                const available = getIntervalsOptionsForRow(p.symbol, i);
                const isCurrentAvailable = available.some((opt) => opt.value === p.interval);
                if (!isCurrentAvailable && available.length > 0) {
                    changed = true;
                    return { ...p, interval: available[0].value };
                }
                return p;
            });
            return changed ? next : prev;
        });
    }, [getIntervalsOptionsForRow]);

    const addNewPair = () => {
        const { symbol, interval } = getNextAvailablePair();
        setNewPairs((prev) => [
            ...prev,
            {
                symbol,
                interval,
                startDateTime: subMonths(new Date(), 1).toISOString(),
                endDateTime: new Date().toISOString(),
                provider: "bybit",
            },
        ]);
    };

    const removePair = (index: number) => {
        setNewPairs((prev) => prev.filter((_, i) => i !== index));
    };

    const savePairs = async () => {
        if (newPairs.length === 0) return;
        try {
            const result = await addHistoricPairData({ data: newPairs }).unwrap();
            if (result.accepted) {
                message.success(result.message ?? "Pairs added");
                onClose();
            } else {
                message.warning(result.message ?? "Request was not accepted");
            }
        } catch {
            message.error("Failed to add pairs");
        }
    };

    const renderOptions = () => {
        return newPairs.map((pair, index) => {
            const intervalsOptions = getIntervalsOptionsForRow(pair.symbol, index);
            const startDate = dayjs(pair.startDateTime);
            const endDate = dayjs(pair.endDateTime);

            return (
                <div key={index} style={{ marginBottom: 16 }}>
                    <Space size={16}>
                        <div style={{ color: '#000', width: 20 }}>{index + 1}. </div>
                        <Select
                            options={pairsOptions}
                            value={pair.symbol}
                            onChange={(value) => handleSymbolChange(index, value)}
                            showSearch
                            optionFilterProp="label"
                        />
                        <Select
                            options={intervalsOptions}
                            value={pair.interval}
                            onChange={(value) => handleIntervalChange(index, value)}
                            showSearch
                            optionFilterProp="label"
                            style={{ width: 80 }}
                        />
                        <DatePicker
                            value={startDate.isValid() ? startDate : dayjs()}
                            onChange={(value) =>
                                updatePair(index, {
                                    startDateTime: value ? value.toDate().toISOString() : new Date().toISOString(),
                                })
                            }
                            showTime
                            style={{ width: 180 }}
                            allowClear={false}
                        />
                        <DatePicker
                            value={endDate.isValid() ? endDate : dayjs()}
                            onChange={(value) =>
                                updatePair(index, {
                                    endDateTime: value ? value.toDate().toISOString() : addDays(new Date(), 1).toISOString(),
                                })
                            }
                            showTime
                            style={{ width: 180 }}
                            allowClear={false}
                        />
                        {index > 0 ? <Button type="link" danger icon={<DeleteOutlined />} onClick={() => removePair(index)} /> : null}
                    </Space>
                </div>
            );
        });
    };


    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add New Pairs"
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" loading={isSubmitting} onClick={savePairs}>
                        Save
                    </Button>
                </div>
            }
        >
            <div style={{ width: 670, maxHeight: 500 }}>
                {renderOptions()}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 16 }}>
                    <Button type="primary" shape="circle" onClick={addNewPair} icon={<PlusOutlined />} />
                </div>
            </div>
        </Modal>
    );
};

export default AddNewPairsModal;