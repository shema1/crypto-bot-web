import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';

const TemplatesTab: FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '8px 0' }}>
      <Typography.Text type="secondary">
        {t('backtest.selectStrategiesModal.tabs.templatesPlaceholder')}
      </Typography.Text>
    </div>
  );
};

export default TemplatesTab;
