import React from "react";
import { Menu, MenuItem, ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "../../utils/Utils";

interface UserMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ anchorEl, open, onClose }) => {
  const handleLogout = () => {
    onClose();
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
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
