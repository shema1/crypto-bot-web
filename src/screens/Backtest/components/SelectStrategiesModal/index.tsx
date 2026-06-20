import { useState, useCallback, type FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tabs } from 'antd';
import { TrendFollowingStrategiesTab, BreakoutStrategiesTab } from './tabs';
import './SelectStrategiesModal.css';
import type { SelectStrategiesModalOnConfirmParams } from '../StrategiesTab';

export interface SelectStrategiesModalProps {
  open: boolean;
  onClose: () => void;
  selectedTrendFollowingStrategies: string[];
  selectedBreakoutStrategies: string[];
  /** Called when user confirms selection with selected strategy ids. */
  onConfirm?: ({
    selectedTrendFollowingStrategies,
    selectedBreakoutStrategies,
  }: SelectStrategiesModalOnConfirmParams) => void;
}

const SelectStrategiesModal: FC<SelectStrategiesModalProps> = ({ open, onClose, onConfirm, selectedTrendFollowingStrategies, selectedBreakoutStrategies }) => {
  const { t } = useTranslation();

  const [selectedTrendFollowingStrategiesState, setSelectedTrendFollowingStrategiesState] = useState<string[]>([]);
  const [selectedBreakoutStrategiesState, setSelectedBreakoutStrategiesState] = useState<string[]>([]);


  const handleSelectedTrendFollowingStrategiesChange = useCallback(
    (keys: React.Key[], _rows: unknown[]) => {
      setSelectedTrendFollowingStrategiesState(keys.map((k) => String(k)));
    },
    [],
  );

  const handleSelectedBreakoutStrategiesChange = useCallback(
    (keys: React.Key[], _rows: unknown[]) => {
      setSelectedBreakoutStrategiesState(keys.map((k) => String(k)));
    },
    [],
  );

  const selectedRowKeys = useMemo(() => {
    return [...selectedTrendFollowingStrategiesState, ...selectedBreakoutStrategiesState];
  }, [selectedTrendFollowingStrategiesState, selectedBreakoutStrategiesState]);

  const handleConfirm = useCallback(() => {
    onConfirm?.({
      selectedTrendFollowingStrategies: selectedTrendFollowingStrategiesState,
      selectedBreakoutStrategies: selectedBreakoutStrategiesState,
    });
    setSelectedTrendFollowingStrategiesState([]);
    setSelectedBreakoutStrategiesState([]);
    onClose();
  }, [selectedTrendFollowingStrategiesState, selectedBreakoutStrategiesState, onConfirm, onClose]);

  const handleClose = useCallback(() => {
    // setSelectedRowKeys([]);
    setSelectedTrendFollowingStrategiesState([]);
    setSelectedBreakoutStrategiesState([]);
    onClose();
  }, [onClose]);


  useEffect(() => {
    if (open) {
      setSelectedTrendFollowingStrategiesState(selectedTrendFollowingStrategies);
      setSelectedBreakoutStrategiesState(selectedBreakoutStrategies);
    }
  }, [open]);

  const tabItems = [
    {
      key: 'trendFollowing',
      label: t('nav.trendFollowing'),
      children: (
        <TrendFollowingStrategiesTab
          selection={{
            selectedRowKeys: selectedTrendFollowingStrategiesState,
            onChange: handleSelectedTrendFollowingStrategiesChange,
          }}
        />
      ),
    },
    {
      key: 'breakout',
      label: t('nav.breakout'),
      children: (
        <BreakoutStrategiesTab
          selection={{
            selectedRowKeys: selectedBreakoutStrategiesState,
            onChange: handleSelectedBreakoutStrategiesChange,
          }}
        />
      ),
    },
    // {
    //   key: 'templates',
    //   label: t('backtest.selectStrategiesModal.tabs.templates'),
    //   children: <TemplatesTab />,
    // },
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
      destroyOnHidden
      width="90vw"
    >
      <Tabs
        className="select-strategies-modal__tabs"
        defaultActiveKey="trendFollowing"
        items={tabItems}
        size="large"
      />
    </Modal>
  );
};

export default SelectStrategiesModal;
