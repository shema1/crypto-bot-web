import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { RouteConfig } from '../routes';
import './SideNav.css';

interface SideNavProps {
  routes: RouteConfig[];
}

function routeToMenuItem(route: RouteConfig, t: (key: string) => string): MenuProps['items'][number] {
  const label = typeof route.label === 'string' ? t(route.label) : route.label;
  if (route.children?.length) {
    return {
      key: route.path,
      icon: route.icon,
      label,
      children: route.children.map((child) => routeToMenuItem(child, t)),
    };
  }
  return {
    key: route.path,
    icon: route.icon,
    label,
  };
}

const SideNav = ({ routes }: SideNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems: MenuProps['items'] = routes.map((r) => routeToMenuItem(r, t));

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={routes.filter((r) => r.children?.length).map((r) => r.path)}
      defaultSelectedKeys={[routes[0]?.path ?? '/']}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      className="side-nav__menu"
    />
  );
};

export default SideNav;
