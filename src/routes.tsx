import type { ReactNode } from 'react';
import { BarChartOutlined, DatabaseOutlined } from '@ant-design/icons';
import { HistoricPairsDataPage, StrategiesPage } from './screens';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: ReactNode;
  element: ReactNode;
}

/**
 * Add new screens here: push a new object with path, label, optional icon, and element.
 * The side nav and routing will pick it up automatically.
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    label: 'Historic Pairs Data',
    icon: <DatabaseOutlined />,
    element: <HistoricPairsDataPage />,
  },
  {
    path: '/strategies',
    label: 'Strategies',
    icon: <BarChartOutlined />,
    element: <StrategiesPage />,
  },
  // Example: add another screen:
  // { path: '/result', label: 'Result', icon: <BarChartOutlined />, element: <Result /> },
];
