





import { Table, Tag, Typography, Space, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import resultsData from './results.json';

const { Title } = Typography;

// Інтерфейс для типізації даних
interface StrategyResult {
  strategy: string;
  params: {
    fast_period: number;
    slow_period: number;
  };
  symbol: string;
  metrics: {
    return: number;
    sharpe: number;
    trades: number;
    volatility: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
    expectancy: number;
  };
}

const Result = () => {
  const results: StrategyResult[] = resultsData;

  const columns: ColumnsType<StrategyResult> = [
    {
      title: 'Стратегія',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 120,
      sorter: (a, b) => a.strategy.localeCompare(b.strategy),
      filters: [
        { text: 'TrendFollowing', value: 'TrendFollowing' },
      ],
      onFilter: (value, record) => record.strategy === value,
    },
    {
      title: 'Символ',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 140,
      sorter: (a, b) => a.symbol.localeCompare(b.symbol),
      render: (symbol: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {symbol}
        </Tag>
      ),
    },
    {
      title: 'Параметри',
      key: 'params',
      width: 100,
      render: (_, record) => (
        <span style={{ fontSize: '0.9em' }}>
          {record.params.fast_period}/{record.params.slow_period}
        </span>
      ),
    },
    {
      title: 'Доходність (%)',
      dataIndex: ['metrics', 'return'],
      key: 'return',
      width: 120,
      sorter: (a, b) => a.metrics.return - b.metrics.return,
      render: (value: number) => (
        <Statistic
          value={value}
          precision={2}
          suffix="%"
          valueStyle={{
            color: value >= 0 ? '#52c41a' : '#ff4d4f',
            fontSize: '14px',
          }}
        />
      ),
    },
    {
      title: 'Коефіцієнт Шарпа',
      dataIndex: ['metrics', 'sharpe'],
      key: 'sharpe',
      width: 130,
      sorter: (a, b) => a.metrics.sharpe - b.metrics.sharpe,
      render: (value: number) => value.toFixed(4),
    },
    {
      title: 'Кількість угод',
      dataIndex: ['metrics', 'trades'],
      key: 'trades',
      width: 120,
      sorter: (a, b) => a.metrics.trades - b.metrics.trades,
      render: (value: number) => (
        <Tag color="geekblue">{value}</Tag>
      ),
    },
    {
      title: 'Волатильність',
      dataIndex: ['metrics', 'volatility'],
      key: 'volatility',
      width: 120,
      sorter: (a, b) => a.metrics.volatility - b.metrics.volatility,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Макс. просадка (%)',
      dataIndex: ['metrics', 'max_drawdown'],
      key: 'max_drawdown',
      width: 140,
      sorter: (a, b) => a.metrics.max_drawdown - b.metrics.max_drawdown,
      render: (value: number) => (
        <Statistic
          value={value}
          precision={2}
          suffix="%"
          valueStyle={{
            color: '#ff4d4f',
            fontSize: '14px',
          }}
        />
      ),
    },
    {
      title: 'Відсоток виграшів',
      dataIndex: ['metrics', 'win_rate'],
      key: 'win_rate',
      width: 140,
      sorter: (a, b) => a.metrics.win_rate - b.metrics.win_rate,
      render: (value: number) => (
        <Statistic
          value={value}
          precision={1}
          suffix="%"
          valueStyle={{
            color: value >= 50 ? '#52c41a' : '#ff4d4f',
            fontSize: '14px',
          }}
        />
      ),
    },
    {
      title: 'Фактор прибутку',
      dataIndex: ['metrics', 'profit_factor'],
      key: 'profit_factor',
      width: 130,
      sorter: (a, b) => a.metrics.profit_factor - b.metrics.profit_factor,
      render: (value: number) => (
        <Statistic
          value={value}
          precision={2}
          valueStyle={{
            color: value >= 1 ? '#52c41a' : '#ff4d4f',
            fontSize: '14px',
          }}
        />
      ),
    },
    {
      title: 'Очікування',
      dataIndex: ['metrics', 'expectancy'],
      key: 'expectancy',
      width: 120,
      sorter: (a, b) => a.metrics.expectancy - b.metrics.expectancy,
      render: (value: number) => (
        <Statistic
          value={value}
          precision={4}
          valueStyle={{
            color: value >= 0 ? '#52c41a' : '#ff4d4f',
            fontSize: '14px',
          }}
        />
      ),
    },
  ];

//   return <div>asdasdasda</div>
  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
          Результати торгових стратегій
        </Title>
        
        <Table
          columns={columns}
          dataSource={results}
          rowKey={(record, index) => `${record.symbol}-${index}`}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} з ${total} записів`,
            pageSizeOptions: ['20', '50', '100', '200'],
          }}
          scroll={{ x: 1500 }}
          size="small"
          bordered
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
      </Space>
    </div>
  );
};

export default Result