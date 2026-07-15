import { CloseOutlined, SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Input,
  InputNumber,
  Tag,
  Typography,
  message,
  theme,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useLazyGetFuturesPairsQuery,
  useLazyGetSymbolsQuery,
} from '../../../../../../../../modules/bybit/apis';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 12;
const DEFAULT_RECOMMENDED_PAIRS_LIMIT = 20;
const MAX_RECOMMENDED_PAIRS_LIMIT = 1000;

export interface SymbolConfigProps {
  symbols: string[];
  disabled?: boolean;
  onChange: (symbols: string[]) => void;
}

const SymbolConfig: FC<SymbolConfigProps> = ({
  symbols,
  disabled = false,
  onChange,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recommendedPairsLimit, setRecommendedPairsLimit] = useState<number | null>(
    DEFAULT_RECOMMENDED_PAIRS_LIMIT
  );
  const [fetchSymbols] = useLazyGetSymbolsQuery();
  const [fetchFuturesPairs, { isLoading: isLoadingFuturesPairs }] =
    useLazyGetFuturesPairsQuery();
  const abortRef = useRef(false);
  const allSymbolsCacheRef = useRef<string[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const shouldLoadAll = isFocused && !trimmed;

    if (!trimmed && !isFocused) {
      setSuggestions([]);
      return;
    }

    abortRef.current = false;

    const load = async () => {
      try {
        if (shouldLoadAll && allSymbolsCacheRef.current) {
          if (abortRef.current) return;
          setSuggestions(allSymbolsCacheRef.current.filter((symbol) => !symbols.includes(symbol)));
          return;
        }

        const result = await fetchSymbols({
          category: 'linear',
          ...(trimmed ? { search: trimmed } : {}),
        }).unwrap();

        if (abortRef.current) return;

        const filtered = result.filter((symbol) => !symbols.includes(symbol));

        if (shouldLoadAll) {
          allSymbolsCacheRef.current = filtered;
          setSuggestions(filtered);
          return;
        }

        setSuggestions(filtered.slice(0, MAX_SUGGESTIONS));
      } catch {
        if (!abortRef.current) setSuggestions([]);
      }
    };

    load();

    return () => {
      abortRef.current = true;
    };
  }, [debouncedSearch, fetchSymbols, isFocused, symbols]);

  const searchOptions = useMemo(
    () =>
      suggestions.map((symbol) => ({
        value: symbol,
        label: symbol,
      })),
    [suggestions]
  );

  const addSymbol = useCallback(
    (symbol: string) => {
      const trimmed = symbol.trim().toUpperCase();
      if (!trimmed || symbols.includes(trimmed)) return;
      onChange([...symbols, trimmed].sort());
      setSearchValue('');
    },
    [symbols, onChange]
  );

  const removeSymbol = useCallback(
    (symbol: string) => {
      onChange(symbols.filter((s) => s !== symbol));
    },
    [symbols, onChange]
  );

  const selectRecommendedPairs = useCallback(async () => {
    if (recommendedPairsLimit === null) return;

    try {
      const recommendedPairs = await fetchFuturesPairs({
        limit: recommendedPairsLimit,
      }).unwrap();
      onChange(recommendedPairs);
    } catch {
      message.error(t('backtest.config.dataSelection.futuresPairs.recommendedError'));
    }
  }, [fetchFuturesPairs, onChange, recommendedPairsLimit, t]);

  return (
    <section className="data-selection__section" aria-labelledby="data-selection-pairs-title">
      <div className="data-selection__section-header">
        <h3 id="data-selection-pairs-title" className="data-selection__section-title">
          {t('backtest.config.dataSelection.futuresPairs.title')}
        </h3>
      </div>
      <Typography.Text type="secondary" className="data-selection__section-hint">
        {t('backtest.config.dataSelection.futuresPairs.hint')}
      </Typography.Text>
      <div className="data-selection__recommended-pairs">
        <label
          className="data-selection__recommended-pairs-label"
          htmlFor="recommended-futures-pairs-limit"
        >
          {t('backtest.config.dataSelection.futuresPairs.recommendedCount')}
        </label>
        <InputNumber
          id="recommended-futures-pairs-limit"
          min={1}
          max={MAX_RECOMMENDED_PAIRS_LIMIT}
          precision={0}
          value={recommendedPairsLimit}
          disabled={disabled || isLoadingFuturesPairs}
          onChange={setRecommendedPairsLimit}
        />
        <Button
          className="data-selection__recommended-pairs-button"
          icon={<ThunderboltOutlined />}
          loading={isLoadingFuturesPairs}
          disabled={disabled || recommendedPairsLimit === null}
          onClick={selectRecommendedPairs}
        >
          {t('backtest.config.dataSelection.futuresPairs.selectRecommended')}
        </Button>
      </div>
      <AutoComplete
        className="data-selection__suggestions"
        options={searchOptions}
        value={searchValue}
        open={isFocused && suggestions.length > 0}
        onChange={setSearchValue}
        onSelect={addSymbol}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
          placeholder={t('backtest.config.dataSelection.futuresPairs.searchPlaceholder')}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onPressEnter={() => addSymbol(searchValue)}
          disabled={disabled}
          allowClear
        />
      </AutoComplete>
      <div className="data-selection__tags">
        {symbols.length === 0 ? (
          <Typography.Text type="secondary">
            {t('backtest.config.dataSelection.futuresPairs.empty')}
          </Typography.Text>
        ) : (
          symbols.map((symbol) => (
            <Tag
              key={symbol}
              closable={!disabled}
              closeIcon={<CloseOutlined />}
              onClose={() => removeSymbol(symbol)}
              style={{
                margin: 0,
                padding: '4px 10px',
                borderRadius: token.borderRadius,
                background: token.colorFillTertiary,
                borderColor: token.colorBorder,
              }}
            >
              {symbol}
            </Tag>
          ))
        )}
      </div>
    </section>
  );
};

export default SymbolConfig;
