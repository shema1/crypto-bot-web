import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import type { PairTimeframeCount } from '../types';

export interface FuturesPairsTabProps {
  dataSource: PairTimeframeCount[];
  loading?: boolean;
}

const FuturesPairsTab: FC<FuturesPairsTabProps> = ({ dataSource, loading = false }) => {
  const { t } = useTranslation();

  const columns: ColumnsType<PairTimeframeCount> = [
    {
      title: t('backtest.detail.pair'),
      dataIndex: 'pair',
      key: 'pair',
      width: 120,
      sorter: (a, b) => a.pair.localeCompare(b.pair),
    },
    {
      title: t('backtest.detail.timeframe'),
      dataIndex: 'timeframe',
      key: 'timeframe',
      width: 100,
      sorter: (a, b) => a.timeframe.localeCompare(b.timeframe),
    },
    {
      title: t('backtest.detail.pairsCount'),
      dataIndex: 'count',
      key: 'count',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.count - b.count,
    },
  ];

  return (
    <div className="futures-pairs-tab">
      <Table<PairTimeframeCount>
        columns={columns}
        dataSource={dataSource}
        rowKey={(r) => `${r.pair}|${r.timeframe}`}
        loading={loading}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default FuturesPairsTab;
