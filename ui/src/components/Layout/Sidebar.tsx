import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { checkSidebarAccess } from "../../utils/permissions";
import { useTheme } from "@mui/material/styles";
import { IconComponent } from "../UI/IconButton/CustomIconButton";

const menuItems = [
  {
    key: "supportDashboard",
    label: "Support Dashboard",
    to: "/dashboard",
    icon: "dashboard",
  },
  {
    key: "allTickets",
    label: "All Tickets",
    to: "/tickets",
    icon: "listAlt",
  },
  {
    key: "myTickets",
    label: "My Tickets",
    to: "/my-tickets",
    icon: "portrait",
  },
  {
    key: "myWorkload",
    label: "My Workload",
    to: "/my-workload",
    icon: "workOutline",
  },
  {
    key: "calendar",
    label: "Calendar",
    to: "/calendar",
    icon: "event",
  },
  {
    key: "rca",
    label: "Root Cause Analysis",
    to: "/root-cause-analysis",
    icon: "grading",
  },
  {
    key: "raiseTickets",
    label: "Raise Ticket",
    to: "/create-ticket",
    icon: "addCircleOutline",
  },
  {
    key: "faq",
    label: "FAQ",
    to: "/faq",
    icon: "questionAnswer",
  },
  {
    key: "knowledgeBase",
    label: "Knowledge Base",
    to: "/knowledge-base",
    icon: "libraryBooks",
  },
  {
    key: "misReports",
    label: "MIS Reports",
    to: "/mis-reports",
    icon: "timeline",
  },
  {
    key: "categoriesMaster",
    label: "Categories Master",
    to: "/categories-master",
    icon: "category",
  },
  {
    key: "escalationMaster",
    label: "Escalation Master",
    to: "/escalation-master",
    icon: "supervisorAccount",
  },
  {
    key: "roleMaster",
    label: "Role Master",
    to: "/role-master",
    icon: "manageAccounts",
  },
  {
    key: "addUser",
    label: "Add New User",
    to: "/users/new",
    icon: "personAddAlt",
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const {
    background: bgColor,
    border: sidebarBorder,
    text: textColor
  } = useMemo(() => theme.palette.sidebar, [theme.palette.mode]);

  console.log(selectedKey)

  return (
    <div
      className="p-0 position-relative"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: collapsed ? "80px" : "280px",
        transition: "width 0.3s",
        display: "flex",
        flexDirection: "column",
        overflow: "clip",
        borderRight: sidebarBorder,
      }}
    >
      <>
        <img src="/menu-leaf.png" className="position-absolute" style={{ left: "0", bottom: "0", width: collapsed ? "80px" : "auto" }} />
        <List component="nav">
          {menuItems.map(({ key, label, to, icon }) => {
            console.log(key === selectedKey);
            if (!checkSidebarAccess(key)) {
              return null;
            }
            return (
              <ListItemButton


                sx={{
                  backgroundColor: selectedKey === key ? 'rgba(168, 252, 213, 0.34)' : 'inherit',
                  color: selectedKey === key ? 'white' : textColor,
                  '&:hover': {
                    backgroundColor: selectedKey === key
                      ? 'rgba(168, 252, 213, 0.34)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                }}


                component={Link}
                to={to}
                key={label}
                onClick={() => setSelectedKey(key)}
              >
                <IconComponent icon={icon} style={{ color: textColor }} className="me-2" />
                {!collapsed && (
                  <ListItemText
                    primaryTypographyProps={{
                      fontSize: "1.2rem",
                      style: { color: selectedKey === key ? 'white' : textColor, },
                    }}
                    primary={t(label)}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </>
    </div>
  );
};

export default Sidebar;
