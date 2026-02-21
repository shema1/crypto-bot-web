import type { ReactNode } from 'react';
import { BarChartOutlined, DatabaseOutlined } from '@ant-design/icons';
import { BacktestPage, BacktestRunDetailPage, BreakoutStrategyPage, HistoricPairsDataPage, MeanReversionStrategyPage, StrategiesPage, TrendFollowingStrategyPage } from './screens';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: ReactNode;
  element?: ReactNode;
  children?: RouteConfig[];
}

/**
 * Add new screens here: push a new object with path, label, optional icon, and element.
 * The side nav and routing will pick it up automatically.
 * Use children for sub-items under a parent menu entry.
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    label: 'nav.historicPairsData',
    icon: <DatabaseOutlined />,
    element: <HistoricPairsDataPage />,
  },
  {
    path: '/strategies',
    label: 'nav.strategies',
    icon: <BarChartOutlined />,
    element: <StrategiesPage />,
    children: [
      {
        path: '/strategies/trend-following',
        label: 'nav.trendFollowing',
        element: <TrendFollowingStrategyPage />,
      },
      {
        path: '/strategies/breakout',
        label: 'nav.breakout',
        element: <BreakoutStrategyPage />,
      },
      // {
      //   path: '/strategies/mean-reversion',
      //   label: 'nav.meanReversion',
      //   element: <MeanReversionStrategyPage />,
      // },
    ],
  },
  {
    path: '/backtest',
    label: 'nav.backtest',
    icon: <BarChartOutlined />,
    element: <BacktestPage />,
  },
  {
    path: '/backtest/:runId',
    label: 'nav.backtest',
    element: <BacktestRunDetailPage />,
  },
];

/** Flatten routes for React Router (parent + all descendants). */
export function getFlatRoutes(config: RouteConfig[]): { path: string; element: ReactNode }[] {
  const result: { path: string; element: ReactNode }[] = [];
  for (const r of config) {
    if (r.element != null) result.push({ path: r.path, element: r.element });
    if (r.children?.length) result.push(...getFlatRoutes(r.children));
  }
  return result;
}
