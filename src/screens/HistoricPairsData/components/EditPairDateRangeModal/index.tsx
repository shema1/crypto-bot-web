import { useCallback, useEffect, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { DatePicker, Modal } from "../../../../components/core";
import { addDays } from "date-fns";
import { Button, message, Space } from "antd";
import dayjs from "dayjs";
import type { AddHistoricPairDataItem } from "../../../../modules/historicPairsMeta/types";
import { useUpdateMetaMutation } from "../../../../modules/historicPairsMeta/apis";

interface EditPairDateRangeModalProps {
    open: boolean;
    onClose: () => void;
    metaId: string;
    pairData: AddHistoricPairDataItem | null;
}

const EditPairDateRangeModal: FC<EditPairDateRangeModalProps> = ({ open, onClose, metaId, pairData }) => {
    const { t } = useTranslation();
    const [pair, setPair] = useState<AddHistoricPairDataItem | null>(pairData);
    const [updateMeta, { isLoading: isSubmitting }] = useUpdateMetaMutation();

    useEffect(() => {
        if (open && pairData) {
            setPair(pairData);
        }
    }, [open, pairData]);

    const updatePair = useCallback((startDateTime: string, endDateTime: string) => {
        setPair((prev) => (prev ? { ...prev, startDateTime, endDateTime } : null));
    }, []);

    const onSave = async () => {
        if (!pair || !metaId) return;
        try {
            await updateMeta({
                id: metaId,
                body: {
                    firstRecordDate: pair.startDateTime,
                    lastRecordDate: pair.endDateTime,
                },
            }).unwrap();
            message.success(t("historicPairsData.messages.dateRangeUpdated"));
            onClose();
        } catch {
            message.error(t("historicPairsData.messages.updateDateRangeError"));
        }
    };

    if (!pair) return null;

    const startDate = dayjs(pair.startDateTime);
    const endDate = dayjs(pair.endDateTime);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t("historicPairsData.editPairDateRangeModal.title")}
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 16 }}>
                    <Button onClick={onClose}>{t("common.cancel")}</Button>
                    <Button type="primary" loading={isSubmitting} onClick={onSave}>
                        {t("common.save")}
                    </Button>
                </div>
            }
        >
            <div style={{ width: 400, maxHeight: 500 }}>
                <Space>
                    <div style={{ color: "#000", marginBottom: 16 }}>
                        {pair.symbol} {pair.interval}
                    </div>
                </Space>
                <Space>
                    <DatePicker
                        value={startDate.isValid() ? startDate : dayjs()}
                        onChange={(value) =>
                            updatePair(
                                value ? value.toDate().toISOString() : new Date().toISOString(),
                                pair.endDateTime
                            )
                        }
                        showTime
                        style={{ width: 180 }}
                        allowClear={false}
                    />
                    <DatePicker
                        value={endDate.isValid() ? endDate : dayjs()}
                        onChange={(value) =>
                            updatePair(
                                pair.startDateTime,
                                value ? value.toDate().toISOString() : addDays(new Date(), 1).toISOString()
                            )
                        }
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