import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { RouteConfig } from '../routes';
import './SideNav.css';

interface SideNavProps {
  routes: RouteConfig[];
}

const SideNav = ({ routes }: SideNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuProps['items'] = routes.map(({ path, label, icon }) => ({
    key: path,
    icon,
    label,
  }));

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultSelectedKeys={[routes[0]?.path ?? '/']}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      className="side-nav__menu"
    />
  );
};

export default SideNav;
