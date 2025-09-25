import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { logout } from "../../utils/Utils";
import { getCurrentUserDetails } from "../../config/config";
import { getRoleLookup, RoleLookupItem } from "../../utils/Utils";

interface UserMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ anchorEl, open, onClose }) => {
  const user = getCurrentUserDetails();
  const [roleLookup, setRoleLookupState] = useState<RoleLookupItem[]>(() => getRoleLookup() ?? []);

  useEffect(() => {
    if (open) {
      setRoleLookupState(getRoleLookup() ?? []);
    }
  }, [open]);

  const roleMap = useMemo(() => {
    if (!roleLookup) {
      return {} as Record<string, string>;
    }

    return roleLookup.reduce((acc: Record<string, string>, item: RoleLookupItem) => {
      const roleId = item?.roleId;
      const roleName = item?.role ?? (roleId != null ? String(roleId) : "");

      if (roleId != null && roleName) {
        acc[String(roleId)] = String(roleName);
      }

      if (typeof item?.role === "string" && roleName) {
        acc[item.role] = String(roleName);
        acc[item.role.toUpperCase()] = String(roleName);
      }

      return acc;
    }, {});
  }, [roleLookup]);

  const rawRoles = useMemo(() => {
    const value = user?.role;
    if (!value) return [] as string[];
    if (Array.isArray(value)) {
      return value.map((role) => String(role));
    }
    return [String(value)];
  }, [user?.role]);

  const displayRoles = useMemo(() => {
    if (!rawRoles.length) return [] as string[];

    const resolved = rawRoles.map((role) => {
      const key = role?.toString?.() ?? "";
      const mapped = roleMap[key] ?? roleMap[key.toUpperCase?.() ?? key];
      if (mapped) {
        return mapped;
      }
      const byValue = Object.entries(roleMap).find(([, name]) => name === key);
      return byValue ? byValue[1] : key;
    });

    return resolved.filter((role, idx) => role && resolved.indexOf(role) === idx);
  }, [rawRoles, roleMap]);

  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((segment) => segment.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.userId) {
      return user.userId.slice(0, 2).toUpperCase();
    }
    return "";
  }, [user?.name, user?.username, user?.userId]);

  const primaryName = user?.name || user?.username || user?.userId || "User";
  const secondaryName = user?.username && user?.username !== user?.name ? user.username : user?.userId;

  const handleLogout = () => {
    onClose();
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const renderDetailRow = (
    icon: React.ReactElement,
    label: string,
    value: React.ReactNode,
  ) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.25,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase", flex: "0 0 auto" }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flex: "1 1 auto",
          minWidth: 0,
          justifyContent: "flex-end",
        }}
      >
        {icon}
        <Typography variant="body2" sx={{ wordBreak: "break-word", textAlign: "right" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{ sx: { mt: 1, minWidth: 280 } }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>{initials || primaryName.charAt(0)}</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {primaryName}
            </Typography>
            {secondaryName && (
              <Typography variant="body2" color="text.secondary">
                {secondaryName}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {renderDetailRow(
            <EmailOutlinedIcon fontSize="small" color="action" />, "EMAIL ID", user?.email || "Not available",
          )}
          {renderDetailRow(
            <PhoneOutlinedIcon fontSize="small" color="action" />, "CONTACT", user?.phone || "Not available",
          )}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.5 }}>
              ROLES
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
              <BadgeOutlinedIcon fontSize="small" color="action" />
              {displayRoles.length ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {displayRoles.map((role) => (
                    <Chip key={role} label={role} size="small" sx={{ fontSize: "0.75rem" }} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">Not available</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
