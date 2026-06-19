import { useEffect, useRef, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Spin, Tag, Typography } from 'antd';
import { useBacktestTaskLogs } from '../../../../modules/backtest/hooks/useBacktestTaskLogs';
import type { BacktestTaskLogEntry, BacktestTaskLogLevel, BacktestTaskLogSource } from '../../../../modules/backtest';
import './LogsTab.css';

interface LogsTabProps {
  taskId: string;
  isRunning?: boolean;
}

const LEVEL_COLORS: Record<BacktestTaskLogLevel, string> = {
  debug: 'default',
  info: 'blue',
  warn: 'orange',
  error: 'red',
};

const SOURCE_COLORS: Record<BacktestTaskLogSource, string> = {
  'bot-helper': 'geekblue',
  'analysis-bot': 'purple',
  'historic-data': 'cyan',
};

function formatTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

const LogLine: FC<{ entry: BacktestTaskLogEntry }> = ({ entry }) => {
  const { t } = useTranslation();

  return (
    <div className={`logs-tab__line logs-tab__line--${entry.level}`}>
      <span className="logs-tab__time">{formatTime(entry.createdAt)}</span>
      <Tag color={LEVEL_COLORS[entry.level]} className="logs-tab__tag">
        {entry.level.toUpperCase()}
      </Tag>
      <Tag color={SOURCE_COLORS[entry.source]} className="logs-tab__tag">
        {t(`backtest.detail.logs.sources.${entry.source}`, entry.source)}
      </Tag>
      <Tag className="logs-tab__tag logs-tab__stage">{entry.stage}</Tag>
      {entry.subtaskIndex !== undefined && (
        <Tag className="logs-tab__tag">#{entry.subtaskIndex}</Tag>
      )}
      <span className="logs-tab__message">{entry.message}</span>
    </div>
  );
};

const LogsTab: FC<LogsTabProps> = ({ taskId, isRunning }) => {
  const { t } = useTranslation();
  const { logs, isLoading } = useBacktestTaskLogs(taskId);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldAutoScrollRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [logs]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 48;
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="logs-tab__loading">
        <Spin />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Empty
        description={t('backtest.detail.logs.empty')}
        className="logs-tab__empty"
      />
    );
  }

  return (
    <div className="logs-tab">
      <div className="logs-tab__header">
        <Typography.Text type="secondary">
          {t('backtest.detail.logs.count', { count: logs.length })}
        </Typography.Text>
        {isRunning && (
          <Tag color="processing">{t('backtest.detail.logs.live')}</Tag>
        )}
      </div>
      <div
        ref={containerRef}
        className="logs-tab__container"
        onScroll={handleScroll}
      >
        {logs.map((entry) => (
          <LogLine key={entry.id ?? entry.sequence} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default LogsTab;
