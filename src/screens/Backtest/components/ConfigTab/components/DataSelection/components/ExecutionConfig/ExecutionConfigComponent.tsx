import { InfoCircleOutlined } from '@ant-design/icons';
import { InputNumber, Switch, Tooltip, Typography } from 'antd';
import { useCallback, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { BacktestExecutionSettings } from '../../../../../../../../modules/backtest';

export interface ExecutionConfigProps {
  executionSettings: BacktestExecutionSettings;
  disabled?: boolean;
  onChange: (value: BacktestExecutionSettings) => void;
}

interface FieldLabelProps {
  label: string;
  tooltip: string;
}

const FieldLabel: FC<FieldLabelProps> = ({ label, tooltip }) => (
  <span className="data-selection__field-label">
    <Typography.Text className="data-selection__sltp-label">{label}</Typography.Text>
    <Tooltip title={tooltip} placement="topLeft" overlayClassName="data-selection__field-tooltip">
      <InfoCircleOutlined className="data-selection__field-label-icon" aria-label={label} />
    </Tooltip>
  </span>
);

const ExecutionConfig: FC<ExecutionConfigProps> = ({
  executionSettings,
  disabled = false,
  onChange,
}) => {
  const { t } = useTranslation();

  const updateField = useCallback(
    <K extends keyof BacktestExecutionSettings>(field: K, value: BacktestExecutionSettings[K] | null) => {
      if (value == null) return;
      onChange({ ...executionSettings, [field]: value });
    },
    [executionSettings, onChange]
  );

  const renderField = (
    labelKey: string,
    tooltipKey: string,
    control: ReactNode,
    switchField = false,
  ) => (
    <div
      className={`data-selection__sltp-field${switchField ? ' data-selection__sltp-field--switch' : ''}`}
    >
      <FieldLabel
        label={t(labelKey)}
        tooltip={t(tooltipKey)}
      />
      {control}
    </div>
  );

  return (
    <section
      className="data-selection__section"
      aria-labelledby="data-selection-execution-title"
    >
      <div className="data-selection__section-header">
        <h3 id="data-selection-execution-title" className="data-selection__section-title">
          {t('backtest.config.dataSelection.execution.title')}
        </h3>
        <Tooltip
          title={t('backtest.config.dataSelection.execution.tooltips.section')}
          placement="topLeft"
          overlayClassName="data-selection__field-tooltip"
        >
          <InfoCircleOutlined className="data-selection__section-title-icon" aria-hidden />
        </Tooltip>
      </div>
      <Typography.Text type="secondary" className="data-selection__section-hint">
        {t('backtest.config.dataSelection.execution.hint')}
      </Typography.Text>
      <div className="data-selection__sltp-fields">
        {renderField(
          'backtest.config.dataSelection.execution.initialCash',
          'backtest.config.dataSelection.execution.tooltips.initialCash',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.initialCash}
              min={100}
              step={1000}
              disabled={disabled}
              onChange={(value) => updateField('initialCash', value)}
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.positionSizePct',
          'backtest.config.dataSelection.execution.tooltips.positionSizePct',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.positionSizePct}
              min={0.1}
              max={100}
              step={0.5}
              addonAfter="%"
              disabled={disabled}
              onChange={(value) => updateField('positionSizePct', value)}
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.leverageOverride',
          'backtest.config.dataSelection.execution.tooltips.leverageOverride',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.leverageOverride ?? undefined}
              min={1}
              max={125}
              step={1}
              placeholder={t('backtest.config.dataSelection.execution.leverageOverridePlaceholder')}
              disabled={disabled}
              onChange={(value) =>
                onChange({
                  ...executionSettings,
                  leverageOverride: value ?? null,
                })
              }
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.commissionRate',
          'backtest.config.dataSelection.execution.tooltips.commissionRate',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.commissionRate}
              min={0}
              max={0.01}
              step={0.0001}
              disabled={disabled}
              onChange={(value) => updateField('commissionRate', value)}
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.slippagePct',
          'backtest.config.dataSelection.execution.tooltips.slippagePct',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.slippagePct}
              min={0}
              max={5}
              step={0.01}
              addonAfter="%"
              disabled={disabled}
              onChange={(value) => updateField('slippagePct', value)}
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.maxDrawdownLimitPct',
          'backtest.config.dataSelection.execution.tooltips.maxDrawdownLimitPct',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.maxDrawdownLimitPct}
              min={1}
              max={100}
              step={1}
              addonAfter="%"
              disabled={disabled}
              onChange={(value) => updateField('maxDrawdownLimitPct', value)}
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.subtaskConcurrency',
          'backtest.config.dataSelection.execution.tooltips.subtaskConcurrency',
          (
            <InputNumber
              className="data-selection__sltp-input"
              value={executionSettings.subtaskConcurrency}
              min={1}
              max={20}
              step={1}
              disabled={disabled}
              onChange={(value) => updateField('subtaskConcurrency', value)}
            />
          ),
        )}
        {renderField(
          'backtest.config.dataSelection.execution.closeOnReverseTrendFollowing',
          'backtest.config.dataSelection.execution.tooltips.closeOnReverseTrendFollowing',
          (
            <Switch
              checked={executionSettings.closeOnReverseSignalTrendFollowing}
              disabled={disabled}
              onChange={(checked) => updateField('closeOnReverseSignalTrendFollowing', checked)}
            />
          ),
          true,
        )}
        {renderField(
          'backtest.config.dataSelection.execution.closeOnReverseBreakout',
          'backtest.config.dataSelection.execution.tooltips.closeOnReverseBreakout',
          (
            <Switch
              checked={executionSettings.closeOnReverseSignalBreakout}
              disabled={disabled}
              onChange={(checked) => updateField('closeOnReverseSignalBreakout', checked)}
            />
          ),
          true,
        )}
        {renderField(
          'backtest.config.dataSelection.execution.timingLogs',
          'backtest.config.dataSelection.execution.tooltips.timingLogs',
          (
            <Switch
              checked={executionSettings.timingLogs}
              disabled={disabled}
              onChange={(checked) => updateField('timingLogs', checked)}
            />
          ),
          true,
        )}
      </div>
    </section>
  );
};

export default ExecutionConfig;
