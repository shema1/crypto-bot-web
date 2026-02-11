import { useCallback, useEffect, useState, type FC } from "react";
import { DatePicker, Modal } from "../../../../components/core";
import type { NewHistoricPair } from "../../types";
import { addDays } from "date-fns";
import { Button, Space } from "antd";
import dayjs from "dayjs";

interface EditPairDateRangeModalProps {
    open: boolean;
    onClose: () => void;
    pairData: NewHistoricPair | null;
}

const EditPairDateRangeModal: FC<EditPairDateRangeModalProps> = ({ open, onClose, pairData }) => {

    const [pair, setPair] = useState<NewHistoricPair | null>(pairData);

    const updatePair = useCallback((startDateTime: string, endDateTime: string) => {
        if (pair) {
            setPair({
                ...pair,
                startDateTime,
                endDateTime,
            });
        }
    }, [pair]);

    const onSave = () => {
        console.log('pair:', pair);
        onClose();
    }

    useEffect(() => {

        if (!pair && pairData) {
            setPair(pairData);
        }
    }, [pairData, pair])

    if (!pair) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit Pair Date Range"
            footer={
                <div style={{ color: 'red', display: 'flex', justifyContent: 'flex-end', marginTop: 16, marginBottom: 16 }}>
                    <Button type="primary" onClick={onSave}>Save</Button>
                </div>
            }
        >
            <div style={{ width: 400, maxHeight: 500 }}>
                <Space>
                    <div style={{color: '#000', marginBottom: 16}}>{pair.symbol} {pair.interval} </div>
                </Space>
                <Space>

                    <DatePicker
                        value={dayjs(pair.startDateTime)}
                        onChange={(value) => {
                            // console.log('value:', value);
                            updatePair(value?.toISOString(), pair.endDateTime)
                        }}
                        showTime
                        style={{ width: 180 }}
                        allowClear={false}
                    />
                    <DatePicker
                        value={dayjs(pair.endDateTime)}
                        onChange={(value) => updatePair(pair.startDateTime, value?.toISOString() ?? addDays(new Date(), 1).toISOString())}
                        showTime
                        style={{ width: 180 }}
                        allowClear={false}
                    />
                </Space>
            </div>
        </Modal>
    );
};

export default EditPairDateRangeModal;