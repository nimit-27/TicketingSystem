import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CategoryIcon from "@mui/icons-material/Category";
import { checkSidebarAccess } from "../../utils/permissions";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { useTheme } from "@mui/material/styles";

const menuItems = [
  {
    key: "myTickets",
    label: "My Tickets",
    to: "/tickets",
    icon: <ListAltIcon />,
  },
  {
    key: "raiseTickets",
    label: "Raise Ticket",
    to: "/create-ticket",
    icon: <AddCircleOutlineIcon />,
  },
  {
    key: "knowledgeBase",
    label: "Knowledge Base",
    to: "/knowledge-base",
    icon: <LibraryBooksIcon />,
  },
  {
    key: "categoriesMaster",
    label: "Categories Master",
    to: "/categories-master",
    icon: <CategoryIcon />,
  },
  {
    key: "escalationMaster",
    label: "Escalation Master",
    to: "/escalation-master",
    icon: <SupervisorAccountIcon />,
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const bgColor = theme.palette.secondary.main;
  const textColor =
    theme.palette.mode === 'light' ? '#FFFFFF' : '#ff9800';
  const sidebarBorder = `1px solid #ff9800`;

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
              <ListItemIcon style={{ color: textColor }}>{icon}</ListItemIcon>
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
