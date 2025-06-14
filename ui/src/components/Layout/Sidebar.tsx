import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText, Button, Stack, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { Roles, currentUserDetails, devMode } from '../../config/config';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  // const [selectedRoles, setSelectedRoles] = useState<string[]>(Array.isArray(currentUserDetails.role) ? currentUserDetails.role : []);

  // const toggleRole = (role: string) => {
  //   const exists = selectedRoles.includes(role);
  //   const updated = exists ? selectedRoles.filter(r => r !== role) : [...selectedRoles, role];
  //   setSelectedRoles(updated);
  //   currentUserDetails.role = updated;
  //   localStorage.setItem('role', JSON.stringify(updated));
  // };

  // const handleAddRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter' && roleInput.trim()) {
  //     const newRole = roleInput.trim().toUpperCase();
  //     setRoleInput('');
  //     if (!selectedRoles.includes(newRole)) {
  //       toggleRole(newRole);
  //     }
  //   }
  // };

  return (
    <div
      className="p-2"
      style={{
        backgroundColor: 'orange',
        width: collapsed ? '80px' : '220px',
        transition: 'width 0.3s',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="text-end mb-3">
        <CustomIconButton icon={collapsed ? 'Menu' : 'ChevronLeft'} size="small" onClick={() => setCollapsed(!collapsed)} />
      </div>
      <List component="nav">
        <ListItemButton component={Link} to="/tickets">
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="My Tickets" />}
        </ListItemButton>
        <ListItemButton component={Link} to="/create-ticket">
          <ListItemIcon>
            <AddCircleOutlineIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Raise Ticket" />}
        </ListItemButton>
        <ListItemButton component={Link} to="/knowledge-base">
          <ListItemIcon>
            <LibraryBooksIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Knowledge Base" />}
        </ListItemButton>
        <ListItemButton component={Link} to="/categories-master">
          <ListItemIcon>
            <CategoryIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Categories Master" />}
        </ListItemButton>
      </List>
      {/* {devMode && (
        <div style={{ marginTop: 'auto' }}>
          {!collapsed && (
            <TextField
              value={roleInput}
              onChange={e => setRoleInput(e.target.value.toUpperCase())}
              onKeyDown={handleAddRole}
              size="small"
              label="Add Role"
              fullWidth
              className="mb-2"
            />
          )}
          <Stack direction="row" flexWrap="wrap" spacing={0.5}>
            {Array.from(new Set([...Roles, ...selectedRoles.filter(r => !Roles.includes(r))])).map(role => (
              <Button
                key={role}
                variant={selectedRoles.includes(role) ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleRole(role)}
                sx={{ mb: 0.5 }}
              >
                {role}
              </Button>
            ))}
          </Stack>
        </div>
      )} */}
    </div>
  );
};

export default Sidebar;
