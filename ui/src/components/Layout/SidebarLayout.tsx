import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const SidebarLayout: React.FC = () => (
  <div className="d-flex" style={{ minHeight: '100vh' }}>
    <Sidebar />
    <div className="flex-grow-1 p-3">
      <Outlet />
    </div>
  </div>
);

export default SidebarLayout;
