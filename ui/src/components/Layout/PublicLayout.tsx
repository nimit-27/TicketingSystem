import React from "react";
import { Outlet } from "react-router-dom";

const PublicLayout: React.FC = () => {
  return (
    <div className="w-100" style={{ minHeight: "100vh" }}>
      <Outlet />
    </div>
  );
};

export default PublicLayout;
