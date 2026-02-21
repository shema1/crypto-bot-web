import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, theme, Select } from 'antd';
import SideNav from './components/SideNav';
import { getFlatRoutes, routes } from './routes';
import { supportedLngs, type SupportedLocale } from './i18n';
import './App.css';

const { Content, Sider } = Layout;

const languageOptions = [
  { value: 'en' as const, label: 'EN' },
  { value: 'uk' as const, label: 'УКР' },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { i18n } = useTranslation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <SideNav routes={routes} />
        <div style={{ padding: 12 }}>
          <Select
            size="small"
            value={(supportedLngs.includes(i18n.resolvedLanguage as SupportedLocale) ? i18n.resolvedLanguage : 'en') as SupportedLocale}
            options={languageOptions}
            onChange={(lng) => { i18n.changeLanguage(lng); }}
            style={{ width: collapsed ? 56 : 80 }}
          />
        </div>
      </Sider>
      <Content style={{ 
        backgroundColor: colorBgContainer,
        overflow: 'hidden',
        overflowY: 'auto',
        }}>
        <Routes>
          {getFlatRoutes(routes).map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </Content>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;