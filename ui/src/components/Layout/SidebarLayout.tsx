import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Drawer from "@mui/material/Drawer";
import { useTheme, useMediaQuery } from "@mui/material";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { usePageTitle } from "../../hooks/usePageTitle";

const SidebarLayout: React.FC = () => {
  useAuthGuard();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [collapsedState, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  usePageTitle();

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
      <div className="d-flex " style={{ flex: "1 1 auto", overflow: "auto" }}>
      {/* <div className="d-flex pb-2" style={{ height: "calc(100vh - 40px)" }}> */}
        {/* SIDEBAR */}
        {isMobile
          ? <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleSidebar}
            ModalProps={{ keepMounted: true }}
          >
            <Sidebar collapsed={false} />
          </Drawer>
          : <Sidebar collapsed={collapsedState} />}

        {/* PAGE VIEW */}
        <div className="container-fluid d-flex mb-2 flex-grow-1 p-2 position-relative" style={{ overflowY: "scroll", overflowX: "clip" }}>
          <img src="/page-leaf.png" className="position-absolute" style={{ right: "0", top: "-60px", zIndex: "-1" }} />
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;
