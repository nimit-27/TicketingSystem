import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="bg-light p-2"
      style={{
        width: collapsed ? '60px' : '200px',
        transition: 'width 0.3s',
      }}
    >
      <div className="text-end mb-3">
        <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
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
    </div>
  );
};

export default Sidebar;
