import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CustomThemeProvider from '../../context/ThemeContext';

const SidebarLayout: React.FC = () => (
  <CustomThemeProvider>
    <Header />
    <div className="d-flex" style={{ minHeight: 'calc(100vh - 50px)' }}>
      <Sidebar />
      <div className="flex-grow-1 p-3" style={{ marginTop: '0' }}>
        <Outlet />
      </div>
    </div>
  </CustomThemeProvider>
);

export default SidebarLayout;
