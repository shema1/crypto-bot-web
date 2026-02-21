import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'antd';

export interface AddBacktestModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const AddBacktestModal: FC<AddBacktestModalProps> = ({ open, onClose, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal
      title={t('backtest.addModal.title')}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('backtest.addModal.cancel')}
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} disabled={!name.trim()}>
          {t('backtest.addModal.save')}
        </Button>,
      ]}
      destroyOnHidden
    >
      <Input
        placeholder={t('backtest.addModal.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onPressEnter={handleSave}
        allowClear
        autoFocus
      />
    </Modal>
  );
};

export default AddBacktestModal;
