import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Drawer from "@mui/material/Drawer";
import { useTheme, useMediaQuery } from "@mui/material";

const SidebarLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [collapsedState, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsedState(!collapsedState);
    }
  };

  const collapsed = isMobile ? !mobileOpen : collapsedState;

  return (
    <>
      <Header collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <div
        className="d-flex pb-2"
        style={{ maxHeight: "97vh", minHeight: "97vh" }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleSidebar}
            ModalProps={{ keepMounted: true }}
          >
            <Sidebar collapsed={false} />
          </Drawer>
        ) : (
          <Sidebar collapsed={collapsedState} />
        )}
        <div
          className="flex-grow-1 p-3"
          style={{ marginTop: "0", overflowY: "scroll" }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;
