import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, InputNumber, Select, Typography } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import {
  useGetTaskResultFilterOptionsQuery,
  type GetTaskResultsQuery,
  type TaskResultFilterOptions,
} from '../../../../modules/backtest';

export interface ResultsFiltersProps {
  taskId: string;
  query: GetTaskResultsQuery;
  onChange: (next: GetTaskResultsQuery) => void;
  onReset: () => void;
}

const ALL_VALUE = '__all__';

function formatSlTpValue(stopLossPct: number, takeProfitPct: number): string {
  return `${stopLossPct}:${takeProfitPct}`;
}

function parseSlTpValue(value: string): { stopLossPct: number; takeProfitPct: number } | null {
  const [slRaw, tpRaw] = value.split(':');
  const stopLossPct = Number(slRaw);
  const takeProfitPct = Number(tpRaw);
  if (!Number.isFinite(stopLossPct) || !Number.isFinite(takeProfitPct)) return null;
  return { stopLossPct, takeProfitPct };
}

function hasActiveFilters(query: GetTaskResultsQuery): boolean {
  return Boolean(
    query.pair ||
      query.timeframe ||
      (query.strategyType && query.strategyType !== 'all') ||
      query.strategyName ||
      query.stopLossPct != null ||
      query.takeProfitPct != null ||
      query.minRoiPct != null ||
      query.minTrades != null ||
      query.profitableOnly ||
      (query.status && query.status !== 'completed'),
  );
}

function buildSlTpOptions(options?: TaskResultFilterOptions) {
  return (options?.slTpCombinations ?? []).map(({ stopLossPct, takeProfitPct }) => {
    const value = formatSlTpValue(stopLossPct, takeProfitPct);
    return {
      value,
      label: `${stopLossPct}/${takeProfitPct}%`,
    };
  });
}

const ResultsFilters: FC<ResultsFiltersProps> = ({ taskId, query, onChange, onReset }) => {
  const { t } = useTranslation();
  const { data: filterOptions, isLoading: isFilterOptionsLoading } =
    useGetTaskResultFilterOptionsQuery(taskId);

  const slTpOptions = useMemo(() => buildSlTpOptions(filterOptions), [filterOptions]);

  const selectedSlTp =
    query.stopLossPct != null && query.takeProfitPct != null
      ? formatSlTpValue(query.stopLossPct, query.takeProfitPct)
      : ALL_VALUE;

  const updateQuery = (patch: Partial<GetTaskResultsQuery>) => {
    onChange({ ...query, ...patch, page: 1 });
  };

  return (
    <div className="results-tab__filters">
      <Typography.Text type="secondary" className="results-tab__filters-label">
        {t('backtest.detail.results.filters')}
      </Typography.Text>

      <div className="results-tab__filters-row">
        <Select
          allowClear
          showSearch
          placeholder={t('backtest.detail.pair')}
          className="results-tab__filter-control"
          loading={isFilterOptionsLoading}
          value={query.pair ?? undefined}
          options={(filterOptions?.pairs ?? []).map((pair) => ({ value: pair, label: pair }))}
          onChange={(pair) => updateQuery({ pair: pair ?? undefined })}
          optionFilterProp="label"
        />

        <Select
          allowClear
          placeholder={t('backtest.detail.timeframe')}
          className="results-tab__filter-control results-tab__filter-control--sm"
          loading={isFilterOptionsLoading}
          value={query.timeframe ?? undefined}
          options={(filterOptions?.timeframes ?? []).map((timeframe) => ({
            value: timeframe,
            label: timeframe,
          }))}
          onChange={(timeframe) => updateQuery({ timeframe: timeframe ?? undefined })}
        />

        <Select
          placeholder={t('backtest.detail.results.strategyType')}
          className="results-tab__filter-control results-tab__filter-control--md"
          value={query.strategyType ?? 'all'}
          options={[
            { value: 'all', label: t('backtest.detail.results.filterAll') },
            ...(filterOptions?.strategyTypes ?? []).map((strategyType) => ({
              value: strategyType,
              label: t(`backtest.detail.results.strategyTypes.${strategyType}`, strategyType),
            })),
          ]}
          onChange={(strategyType) =>
            updateQuery({ strategyType: strategyType === 'all' ? undefined : strategyType })
          }
        />

        <Select
          allowClear
          showSearch
          placeholder={t('backtest.detail.results.strategyName')}
          className="results-tab__filter-control results-tab__filter-control--lg"
          loading={isFilterOptionsLoading}
          value={query.strategyName ?? undefined}
          options={(filterOptions?.strategyNames ?? []).map((strategyName) => ({
            value: strategyName,
            label: strategyName,
          }))}
          onChange={(strategyName) => updateQuery({ strategyName: strategyName ?? undefined })}
          optionFilterProp="label"
        />

        <Select
          placeholder={t('backtest.detail.results.slTp')}
          className="results-tab__filter-control results-tab__filter-control--sm"
          loading={isFilterOptionsLoading}
          value={selectedSlTp}
          options={[
            { value: ALL_VALUE, label: t('backtest.detail.results.filterAll') },
            ...slTpOptions,
          ]}
          onChange={(value) => {
            if (value === ALL_VALUE) {
              updateQuery({ stopLossPct: undefined, takeProfitPct: undefined });
              return;
            }
            const parsed = parseSlTpValue(value);
            if (!parsed) return;
            updateQuery(parsed);
          }}
        />

        <Select
          placeholder={t('backtest.detail.results.statusLabel')}
          className="results-tab__filter-control results-tab__filter-control--md"
          value={query.status ?? 'completed'}
          options={[
            { value: 'completed', label: t('backtest.detail.results.statusCompleted') },
            { value: 'failed', label: t('backtest.detail.results.statusFailed') },
            { value: 'all', label: t('backtest.detail.results.statusAll') },
          ]}
          onChange={(status) => updateQuery({ status })}
        />
      </div>

      <div className="results-tab__filters-row results-tab__filters-row--secondary">
        <InputNumber
          placeholder={t('backtest.detail.results.minRoi')}
          className="results-tab__filter-control results-tab__filter-control--sm"
          value={query.minRoiPct}
          step={0.5}
          addonAfter="%"
          onChange={(value) =>
            updateQuery({ minRoiPct: typeof value === 'number' ? value : undefined })
          }
        />

        <InputNumber
          placeholder={t('backtest.detail.results.minTrades')}
          className="results-tab__filter-control results-tab__filter-control--sm"
          value={query.minTrades}
          min={0}
          step={1}
          onChange={(value) =>
            updateQuery({ minTrades: typeof value === 'number' ? value : undefined })
          }
        />

        <Checkbox
          checked={Boolean(query.profitableOnly)}
          onChange={(event) => updateQuery({ profitableOnly: event.target.checked || undefined })}
        >
          {t('backtest.detail.results.profitableOnly')}
        </Checkbox>

        {hasActiveFilters(query) && (
          <Button icon={<ClearOutlined />} onClick={onReset}>
            {t('backtest.detail.results.resetFilters')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultsFilters;
