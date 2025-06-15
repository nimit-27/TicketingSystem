import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CustomThemeProvider from '../../context/ThemeContext';

const SidebarLayout: React.FC = () => (
  <CustomThemeProvider>
    <Header />
    <div className="d-flex pb-2" style={{ maxHeight: '97vh' }}>
      <Sidebar />
      <div className="flex-grow-1 p-3" style={{ marginTop: '0', overflowY: 'scroll' }}>
        <Outlet />
      </div>
    </div>
  </CustomThemeProvider>
);

export default SidebarLayout;
