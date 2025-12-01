import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const PublicLayout: React.FC = () => {
  return (
    <>
      <Header
        collapsed={false}
        toggleSidebar={() => undefined}
        showMenuToggle={false}
        showNotifications={false}
        showProfile={false}
      />
      <div className="w-100" style={{ minHeight: "calc(100vh - 56px)" }}>
        <Outlet />
      </div>
    </>
  );
};

export default PublicLayout;
