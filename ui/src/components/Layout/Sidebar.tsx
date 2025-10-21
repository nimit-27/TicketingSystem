import React, { useMemo } from "react";
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
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    background: bgColor,
    border: sidebarBorder,
    text: textColor
  } = useMemo(() => theme.palette.sidebar, [theme.palette.mode]);

  return (
    <div
      className="p-2"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: collapsed ? "80px" : "280px",
        transition: "width 0.3s",
        display: "flex",
        flexDirection: "column",
        borderRight: sidebarBorder,
      }}
    >
      <List component="nav">
        {menuItems.map(({ key, label, to, icon }) => {
          if (!checkSidebarAccess(key)) {
            return null;
          }
          return (
            <ListItemButton component={Link} to={to} key={label}>
              <IconComponent icon={icon} style={{ color: textColor }} className="me-2" />
              {!collapsed && (
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.2rem",
                    style: { color: textColor },
                  }}
                  primary={t(label)}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );
};

export default Sidebar;
