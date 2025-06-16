import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { currentUserDetails } from '../../config/config';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const menuItems = [
  {
    label: 'My Tickets',
    to: '/tickets',
    icon: <ListAltIcon />,
  },
  {
    label: 'Raise Ticket',
    to: '/create-ticket',
    icon: <AddCircleOutlineIcon />,
  },
  {
    label: 'Knowledge Base',
    to: '/knowledge-base',
    icon: <LibraryBooksIcon />,
  },
  {
    label: 'Categories Master',
    to: '/categories-master',
    icon: <CategoryIcon />,
  },
  {
    label: 'Escalation Master',
    to: '/escalation-master',
    icon: <SupervisorAccountIcon />,
    roles: ['ADMIN', 'IT'],
  },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="p-2"
      style={{
        backgroundColor: '#FF671F',
        width: collapsed ? '80px' : '280px',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="text-end mb-3">
        <CustomIconButton
          icon={collapsed ? 'Menu' : 'ChevronLeft'}
          size="small"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <List component="nav">
        {menuItems.map(({ label, to, icon, roles }) => {
          if (roles && !roles.some(r => currentUserDetails.role.includes(r))) {
            return null;
          }
          return (
            <ListItemButton component={Link} to={to} key={label}>
              <ListItemIcon className='text-white'>{icon}</ListItemIcon>
              {!collapsed && (
                <ListItemText className='text-white fs-1' primaryTypographyProps={{ fontSize: '1.2rem' }} primary={label} />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );
};

export default Sidebar;
