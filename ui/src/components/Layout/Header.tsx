import React, { useContext } from "react";
import { ThemeModeContext } from "../../context/ThemeContext";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import Avatar from "@mui/material/Avatar";
import { currentUserDetails } from "../../config/config";
import { useTheme } from "@mui/material/styles";

interface HeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggleSidebar }) => {
  const { toggle, mode } = useContext(ThemeModeContext);
  const theme = useTheme();
  const initials = currentUserDetails.name
    ? currentUserDetails.name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <header
      style={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        width: "100%",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <CustomIconButton
        style={{
          color: theme.palette.getContrastText(theme.palette.primary.main),
        }}
        icon={collapsed ? "menu" : "chevronleft"}
        onClick={toggleSidebar}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CustomIconButton
          style={{
            color: theme.palette.getContrastText(theme.palette.primary.main),
          }}
          icon={mode === "light" ? "darkmode" : "lightmode"}
          onClick={toggle}
        />
        <Avatar
          sx={{
            bgcolor: theme.palette.grey[600],
            width: 32,
            height: 32,
            fontSize: 14,
          }}
        >
          {initials}
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
