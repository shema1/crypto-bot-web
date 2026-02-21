import { useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
import type { CreateBreakoutStrategyRequest } from '../../../../../modules/strategies/breakoutStrategy';
import type { BreakoutStrategyItem } from '../../../../../modules/strategies/breakoutStrategy';

export type BreakoutStrategyFormValues = CreateBreakoutStrategyRequest;

export interface BreakoutStrategyFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, modal is in edit mode; otherwise create mode. */
  initialValues?: BreakoutStrategyItem | null;
  onSubmit: (values: BreakoutStrategyFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const BreakoutStrategyFormModal: FC<BreakoutStrategyFormModalProps> = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<BreakoutStrategyFormValues>();
  const isEdit = initialValues != null;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          lookback_period: initialValues.lookback_period,
          breakout_buffer: initialValues.breakout_buffer,
          min_volume_ratio: initialValues.min_volume_ratio,
          leverage: initialValues.leverage,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      onClose();
    } catch {
      // validation or API error – form or message will show it
    }
  };

  const title = isEdit
    ? t('strategies.breakout.form.titleEdit')
    : t('strategies.breakout.form.titleCreate');

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isSubmitting}>
          {t('strategies.breakout.form.cancel')}
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={isSubmitting}
          onClick={() => handleSubmit()}
        >
          {t('strategies.breakout.form.save')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label={t('strategies.breakout.form.nameLabel')}
          rules={[{ required: true, message: t('strategies.breakout.form.nameRequired') }]}
        >
          <Input placeholder={t('strategies.breakout.form.namePlaceholder')} allowClear />
        </Form.Item>
        <Form.Item
          name="lookback_period"
          label={t('strategies.breakout.form.lookbackPeriod')}
          rules={[{ required: true, message: t('strategies.breakout.form.fieldRequired') }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="breakout_buffer"
          label={t('strategies.breakout.form.breakoutBuffer')}
          rules={[{ required: true, message: t('strategies.breakout.form.fieldRequired') }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="min_volume_ratio"
          label={t('strategies.breakout.form.minVolumeRatio')}
          rules={[{ required: true, message: t('strategies.breakout.form.fieldRequired') }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="leverage"
          label={t('strategies.breakout.form.leverage')}
          rules={[{ required: true, message: t('strategies.breakout.form.fieldRequired') }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BreakoutStrategyFormModal;
