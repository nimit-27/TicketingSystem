import React, { useEffect, useMemo, useState } from 'react';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '../../types/notification';

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const renderNotification = (notification: NotificationItem, theme: Theme) => {
  const highlightColor =
    theme.palette.mode === 'dark'
      ? theme.palette.action.selected
      : theme.palette.action.hover;

  return (
    <ListItem
      key={notification.id}
      alignItems="flex-start"
      sx={{
        py: 1,
        px: 1.5,
        bgcolor: notification.read ? 'transparent' : highlightColor,
        borderLeft: notification.read ? '4px solid transparent' : `4px solid ${theme.palette.primary.main}`,
        borderRadius: 1,
        transition: 'background-color 0.2s ease',
      }}
    >
      <ListItemText
        primary={
          <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 500 : 600 }}>
            {notification.title || 'Notification'}
          </Typography>
        }
        secondary={
          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {notification.message && (
              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(notification.timestamp)}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

interface NotificationBellProps {
  iconColor: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ iconColor }) => {
  const theme = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const menuOpen = Boolean(anchorEl);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [notifications]
  );

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (menuOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [menuOpen, unreadCount, markAllAsRead]);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: iconColor,
          '&:hover': {
            color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.primary.contrastText,
          },
        }}
        aria-label="Notifications"
      >
        <Badge color="error" badgeContent={unreadCount} overlap="circular">
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 420,
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {sortedNotifications.length === 0 ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {sortedNotifications.map(notification => (
              <React.Fragment key={notification.id}>
                {renderNotification(notification, theme)}
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
