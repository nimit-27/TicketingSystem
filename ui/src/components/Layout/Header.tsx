import React, { useContext, useState } from "react";
import { ThemeModeContext } from "../../context/ThemeContext";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import Avatar from "@mui/material/Avatar";
import { getCurrentUserDetails } from "../../config/config";
import { useTheme } from "@mui/material/styles";
import { LanguageContext } from "../../context/LanguageContext";
import { DevModeContext } from "../../context/DevModeContext";
import UserMenu from "./UserMenu";

interface HeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggleSidebar }) => {
  const { toggle, mode } = useContext(ThemeModeContext);
  const { toggleLanguage } = useContext(LanguageContext);
  const { toggleDevMode, devMode } = useContext(DevModeContext);
  const theme = useTheme();
  const user = getCurrentUserDetails();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const initials = user?.name
    ? user?.name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "";

  const headerBgColor =
    theme.palette.mode === "dark"
      ? theme.palette.secondary.main
      : theme.palette.primary.main;

  const iconColor =
    theme.palette.mode === "dark"
      ? theme.palette.success.main
      : theme.palette.getContrastText(headerBgColor);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <header
      style={{
        backgroundColor: headerBgColor,
        color: iconColor,
        width: "100%",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom:
          theme.palette.mode === "dark"
            ? `1px solid ${theme.palette.success.main}`
            : undefined,
      }}
    >
      <CustomIconButton
        style={{
          color: iconColor,
        }}
        icon={collapsed ? "menu" : "chevronleft"}
        onClick={toggleSidebar}
      />
      <div>
        {theme.palette.mode === 'light' && (
          <img src="/logo.png" style={{ height: '50px' }} />
        )}
        {theme.palette.mode === 'dark' && (
          <img src="/fciLogo.png" style={{ height: '50px' }} />
        )}
      </div>
      <div className="d-flex align-items-center" style={{ marginLeft: "auto", gap: "8px" }}>
        <CustomIconButton
          style={{
            color: iconColor,
          }}
          icon={mode === "light" ? "darkmode" : "lightmode"}
          onClick={toggle}
        />
        <CustomIconButton
          style={{
            color: iconColor,
          }}
          icon="translate"
          onClick={toggleLanguage}
        />
        <CustomIconButton
          style={{
            color: devMode ? theme.palette.warning.main : iconColor,
          }}
          icon="code"
          onClick={toggleDevMode}
        />
        <Avatar
          sx={{
            bgcolor: theme.palette.grey[600],
            width: 32,
            height: 32,
            fontSize: 14,
            cursor: "pointer",
          }}
          onClick={handleAvatarClick}
        >
          {initials}
        </Avatar>
      </div>
      <UserMenu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose} />
    </header>
  );
};

export default Header;
