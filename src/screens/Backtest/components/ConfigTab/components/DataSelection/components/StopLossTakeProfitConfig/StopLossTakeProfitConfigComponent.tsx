import { InputNumber, Typography } from 'antd';
import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestStopLossTakeProfit } from '../../../../../../../../modules/backtest';

export interface StopLossTakeProfitConfigProps {
  stopLossTakeProfit: BacktestStopLossTakeProfit;
  disabled?: boolean;
  onChange: (value: BacktestStopLossTakeProfit) => void;
}

const StopLossTakeProfitConfig: FC<StopLossTakeProfitConfigProps> = ({
  stopLossTakeProfit,
  disabled = false,
  onChange,
}) => {
  const { t } = useTranslation();

  const updateField = useCallback(
    (field: keyof BacktestStopLossTakeProfit, value: number | null) => {
      if (value == null) return;
      onChange({ ...stopLossTakeProfit, [field]: value });
    },
    [onChange, stopLossTakeProfit]
  );

  return (
    <section
      className="data-selection__section"
      aria-labelledby="data-selection-stop-loss-take-profit-title"
    >
      <div className="data-selection__section-header">
        <h3 id="data-selection-stop-loss-take-profit-title" className="data-selection__section-title">
          {t('backtest.config.dataSelection.stopLossTakeProfit.title')}
        </h3>
      </div>
      <Typography.Text type="secondary" className="data-selection__section-hint">
        {t('backtest.config.dataSelection.stopLossTakeProfit.hint')}
      </Typography.Text>
      <div className="data-selection__sltp-fields">
        <div className="data-selection__sltp-field">
          <Typography.Text className="data-selection__sltp-label">
            {t('backtest.config.dataSelection.stopLossTakeProfit.stopLoss')}
          </Typography.Text>
          <InputNumber
            className="data-selection__sltp-input"
            value={stopLossTakeProfit.stopLoss}
            min={0}
            step={0.1}
            addonAfter="%"
            disabled={disabled}
            onChange={(value) => updateField('stopLoss', value)}
          />
        </div>
        <div className="data-selection__sltp-field">
          <Typography.Text className="data-selection__sltp-label">
            {t('backtest.config.dataSelection.stopLossTakeProfit.takeProfit')}
          </Typography.Text>
          <InputNumber
            className="data-selection__sltp-input"
            value={stopLossTakeProfit.takeProfit}
            min={0}
            step={0.1}
            addonAfter="%"
            disabled={disabled}
            onChange={(value) => updateField('takeProfit', value)}
          />
        </div>
        <div className="data-selection__sltp-field">
          <Typography.Text className="data-selection__sltp-label">
            {t('backtest.config.dataSelection.stopLossTakeProfit.step')}
          </Typography.Text>
          <InputNumber
            className="data-selection__sltp-input"
            value={stopLossTakeProfit.stopLossTakeProfitStep}
            min={0}
            step={0.1}
            addonAfter="%"
            disabled={disabled}
            onChange={(value) => updateField('stopLossTakeProfitStep', value)}
          />
        </div>
      </div>
    </section>
  );
};

export default StopLossTakeProfitConfig;
