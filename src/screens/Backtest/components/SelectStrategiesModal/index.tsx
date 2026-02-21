import { useState, useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tabs } from 'antd';
import { TrendFollowingStrategiesTab, SavedTab, TemplatesTab } from './tabs';
import './SelectStrategiesModal.css';

export interface SelectStrategiesModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when user confirms selection with selected strategy ids. */
  onConfirm?: (selectedIds: string[]) => void;
}

const SelectStrategiesModal: FC<SelectStrategiesModalProps> = ({ open, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleSelectionChange = useCallback(
    (keys: React.Key[], _rows: unknown[]) => {
      setSelectedRowKeys(keys);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    const ids = selectedRowKeys.map((k) => String(k));
    onConfirm?.(ids);
    setSelectedRowKeys([]);
    onClose();
  }, [selectedRowKeys, onConfirm, onClose]);

  const handleClose = useCallback(() => {
    setSelectedRowKeys([]);
    onClose();
  }, [onClose]);

  const tabItems = [
    {
      key: 'all',
      label: 'Trend Following',
      children: (
        <TrendFollowingStrategiesTab
          selection={{
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
        />
      ),
    },
    {
      key: 'saved',
      label: t('backtest.selectStrategiesModal.tabs.saved'),
      children: <SavedTab />,
    },
    {
      key: 'templates',
      label: t('backtest.selectStrategiesModal.tabs.templates'),
      children: <TemplatesTab />,
    },
  ];

  const footer = (
    <>
      <Button onClick={handleClose}>{t('backtest.selectStrategiesModal.footer.cancel')}</Button>
      <Button type="primary" onClick={handleConfirm} disabled={selectedRowKeys.length === 0}>
        {t('backtest.selectStrategiesModal.footer.addSelected')} ({selectedRowKeys.length})
      </Button>
    </>
  );

  return (
    <Modal
      className="select-strategies-modal"
      title={t('backtest.selectStrategiesModal.title')}
      open={open}
      onCancel={handleClose}
      footer={footer}
      destroyOnClose
      width="90vw"
    >
      <Tabs
        className="select-strategies-modal__tabs"
        defaultActiveKey="all"
        items={tabItems}
        size="large"
      />
    </Modal>
  );
};

export default SelectStrategiesModal;
