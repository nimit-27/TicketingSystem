import React, { useContext, useMemo, useState } from "react";
import { ThemeModeContext } from "../../context/ThemeContext";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import Avatar from "@mui/material/Avatar";
import { devMode as envDevMode, getCurrentUserDetails } from "../../config/config";
import { useTheme } from "@mui/material/styles";
import { LanguageContext } from "../../context/LanguageContext";
import { DevModeContext } from "../../context/DevModeContext";
import UserMenu from "./UserMenu";
import NotificationBell from "../Notifications/NotificationBell";
import { useTranslation } from "react-i18next";
import { checkHeaderAccess } from "../../utils/permissions";

interface HeaderProps {
  collapsed?: boolean;
  toggleSidebar?: () => void;
  showMenuToggle?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  collapsed = false,
  toggleSidebar = () => undefined,
  showMenuToggle = true,
  showNotifications = true,
  showProfile = true,
}) => {
  const { toggle, mode, toggleLayout, layout } = useContext(ThemeModeContext);
  const { toggleLanguage } = useContext(LanguageContext);
  const { toggleDevMode, devMode, jwtBypass, toggleJwtBypass } = useContext(DevModeContext);
  const theme = useTheme();
  const { t } = useTranslation();
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

  const headerBgColor = theme.palette.header.background;

  const iconColor = theme.palette.header.icon.color;

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const fciLogo = useMemo(() => {
    if (theme.palette.mode === "light") return "./logo.png"
    else if (theme.palette.mode === "dark") return "./fciLogo.png"
  }, [theme.palette.mode])

  const showLightDarkModeIcon = checkHeaderAccess("lightDarkModeIcon");
  const showTranslateIcon = checkHeaderAccess("translateIcon");
  const showDevModeIcon = checkHeaderAccess("devModeIcon");
  const showNotificationIcon =
    showNotifications &&
    checkHeaderAccess("notifications") &&
    checkHeaderAccess(["notifications", "icon"]);
  const showNotificationDropdown =
    checkHeaderAccess("notifications") &&
    checkHeaderAccess(["notifications", "dropdown"]);
  const showUserProfileIcon =
    showProfile &&
    Boolean(user) &&
    checkHeaderAccess("userProfile") &&
    checkHeaderAccess(["userProfile", "icon"]);
  const showUserProfileDropdown =
    showProfile &&
    checkHeaderAccess("userProfile") &&
    checkHeaderAccess(["userProfile", "dropdown"]);

  return (
    <header
      className="d-flex py-1 px-2 align-items-center"
      style={{
        backgroundColor: headerBgColor,
        color: iconColor,
        borderBottom: theme.palette.header.border,
        position: 'relative'
      }}
    >
      <div className="d-flex align-items-center" style={{ gap: '8px' }}>
        {showMenuToggle && (
          <CustomIconButton
            style={{ color: iconColor }}
            icon={collapsed ? "menu" : "chevronleft"}
            onClick={toggleSidebar}
          />
        )}
        <div>
          <img src={fciLogo} style={{ height: '25px' }} />
        </div>
        <h5 className="p-0 m-0 fw-bold">{t("Anna Darpan")}</h5>
      </div>
      <div
        className="w-100 text-center"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 600,
          letterSpacing: 0.5,
          color: iconColor,
          fontSize: '1.2rem',
          pointerEvents: 'none'
        }}
      >
        {t("Ticketing System")}
      </div>
      <div className="d-flex align-items-center" style={{ marginLeft: "auto", gap: "8px" }}>
        {showLightDarkModeIcon && (
          <CustomIconButton
            style={{ color: iconColor }}
            icon={mode === "light" ? "darkmode" : "lightmode"}
            onClick={toggle}
          />
        )}
        {showTranslateIcon && (
          <CustomIconButton
            style={{ color: iconColor }}
            icon="translate"
            onClick={toggleLanguage}
          />
        )}
        {showDevModeIcon && (
          <CustomIconButton
            style={{ color: devMode ? theme.palette.warning.main : iconColor }}
            icon="code"
            onClick={toggleDevMode}
          />
        )}
        {showDevModeIcon && devMode && (
          <CustomIconButton
            style={{
              color: jwtBypass
                ? theme.palette.error.light || theme.palette.error.main
                : theme.palette.success.light || theme.palette.success.main,
            }}
            icon={jwtBypass ? "lockOpen" : "verifiedUser"}
            onClick={toggleJwtBypass}
            title={jwtBypass ? "JWT bypass enabled" : "JWT protection active"}
          />
        )}
        {showDevModeIcon && devMode && <CustomIconButton
          style={{ color: iconColor, fontSize: 14 }}
          icon={layout.toString()}
          // icon="code"
          onClick={toggleLayout}
        />}
        {showNotificationIcon && (
          <NotificationBell iconColor={iconColor} showDropdown={showNotificationDropdown} />
        )}
        {showUserProfileIcon && (
          <Avatar
            sx={{
              bgcolor: "white",
              width: 32,
              height: 32,
              fontSize: 14,
              cursor: "pointer",
              color: theme.palette.primary.main,
            }}
            onClick={handleAvatarClick}
          >
            {initials}
          </Avatar>
        )}
      </div>
      {showUserProfileDropdown && (
        <UserMenu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose} />
      )}
    </header>
  );
};

export default Header;
