import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SmsIcon from '@mui/icons-material/Sms';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Title from '../components/Title';
import { useApi } from '../hooks/useApi';
import {
    getRoleNotificationChannelGrid,
    NotificationChannel,
    RoleNotificationGridResponse,
    RoleNotificationMappingState,
    RoleNotificationRole,
    RoleNotificationType,
    updateRoleNotificationChannels,
} from '../services/RoleNotificationChannelService';
import { getUserDetails } from '../utils/Utils';
import { useSnackbar } from '../context/SnackbarContext';
import { useNavigate } from 'react-router-dom';

const CHANNELS: NotificationChannel[] = ['EMAIL', 'IN_APP', 'SMS'];

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
    EMAIL: 'Email',
    IN_APP: 'In App',
    SMS: 'SMS',
};

const channelIcon = (channel: NotificationChannel) => {
    if (channel === 'EMAIL') return <EmailIcon fontSize="small" />;
    if (channel === 'IN_APP') return <NotificationsIcon fontSize="small" />;
    return <SmsIcon fontSize="small" />;
};

const keyFor = (roleId: number, notificationTypeId: number, channel: NotificationChannel) => (
    `${roleId}:${notificationTypeId}:${channel}`
);


const buildState = (grid?: RoleNotificationGridResponse | null): Record<string, boolean> => {
    const state: Record<string, boolean> = {};
    if (!grid) return state;

    grid.notifications.forEach((notification) => {
        grid.roles.forEach((role) => {
            CHANNELS.forEach((channel) => {
                state[keyFor(role.roleId, notification.notificationTypeId, channel)] = false;
            });
        });
    });

    grid.mappings.forEach((mapping: RoleNotificationMappingState) => {
        CHANNELS.forEach((channel) => {
            state[keyFor(mapping.roleId, mapping.notificationTypeId, channel)] = Boolean(mapping.channels?.[channel]);
        });
    });

    return state;
};

const RoleNotification: React.FC = () => {
    const navigate = useNavigate();
    const { showMessage } = useSnackbar();
    const { data: gridData, pending, apiHandler } = useApi<RoleNotificationGridResponse>();
    const { pending: saving, apiHandler: saveApiHandler } = useApi<any>();

    const [currentState, setCurrentState] = useState<Record<string, boolean>>({});
    const [originalState, setOriginalState] = useState<Record<string, boolean>>({});
    const [roleFilter, setRoleFilter] = useState('');
    const [notificationFilter, setNotificationFilter] = useState('');

    const loadGrid = () => {
        apiHandler(() => getRoleNotificationChannelGrid());
    };

    useEffect(() => {
        loadGrid();
    }, []);

    useEffect(() => {
        const initial = buildState(gridData);
        setOriginalState(initial);
        setCurrentState(initial);
    }, [gridData]);

    const dirtyKeys = useMemo(() => (
        Object.keys(currentState).filter((key) => currentState[key] !== originalState[key])
    ), [currentState, originalState]);

    const hasUnsavedChanges = dirtyKeys.length > 0;

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges) return;
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const filteredRoles = useMemo(() => {
        const query = roleFilter.trim().toLowerCase();
        const roles = gridData?.roles ?? [];
        if (!query) return roles;
        return roles.filter((role) => role.role.toLowerCase().includes(query));
    }, [gridData?.roles, roleFilter]);

    const filteredNotifications = useMemo(() => {
        const query = notificationFilter.trim().toLowerCase();
        const notifications = gridData?.notifications ?? [];
        if (!query) return notifications;
        return notifications.filter((notification) => (
            notification.name.toLowerCase().includes(query)
            || notification.code?.toLowerCase().includes(query)
            || notification.description?.toLowerCase().includes(query)
        ));
    }, [gridData?.notifications, notificationFilter]);

    const toggleChannel = (roleId: number, notificationTypeId: number, channel: NotificationChannel) => {
        const key = keyFor(roleId, notificationTypeId, channel);
        setCurrentState((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const setVisibleChannels = (active: boolean) => {
        setCurrentState((prev) => {
            const next = { ...prev };
            filteredNotifications.forEach((notification) => {
                filteredRoles.forEach((role) => {
                    CHANNELS.forEach((channel) => {
                        next[keyFor(role.roleId, notification.notificationTypeId, channel)] = active;
                    });
                });
            });
            return next;
        });
    };

    const resetChanges = () => {
        setCurrentState(originalState);
    };

    const saveChanges = async () => {
        if (!gridData || dirtyKeys.length === 0) {
            showMessage('No notification channel changes to save.', 'info');
            return;
        }

        const items = dirtyKeys.map((key) => {
            const [roleId, notificationTypeId, channelCode] = key.split(':');
            return {
                roleId: Number(roleId),
                notificationTypeId: Number(notificationTypeId),
                channelCode: channelCode as NotificationChannel,
                isActive: currentState[key],
            };
        });

        const result = await saveApiHandler(() => updateRoleNotificationChannels({
            updatedBy: getUserDetails()?.username || getUserDetails()?.userId || 'SYSTEM',
            items,
        }));
        if (!result) return;
        showMessage('Role notification channels saved successfully.', 'success');
        setOriginalState(currentState);
        loadGrid();
    };

    const handleBack = () => {
        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Leave without saving?')) {
            return;
        }
        navigate('/role-master');
    };

    const renderCell = (role: RoleNotificationRole, notification: RoleNotificationType) => (
        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ minWidth: 120 }}>
            {CHANNELS.map((channel) => {
                const stateKey = keyFor(role.roleId, notification.notificationTypeId, channel);
                const active = Boolean(currentState[stateKey]);
                const changed = currentState[stateKey] !== originalState[stateKey];
                return (
                    <Tooltip
                        key={channel}
                        title={`${CHANNEL_LABELS[channel]} ${active ? 'active' : 'inactive'}${changed ? ' (unsaved)' : ''}`}
                    >
                        <IconButton
                            aria-label={`${role.role} ${notification.name} ${CHANNEL_LABELS[channel]} ${active ? 'active' : 'inactive'}`}
                            size="small"
                            color={active ? 'primary' : 'default'}
                            onClick={() => toggleChannel(role.roleId, notification.notificationTypeId, channel)}
                            sx={{
                                border: '1px solid',
                                borderColor: changed ? 'warning.main' : active ? 'primary.main' : 'divider',
                                backgroundColor: active ? 'primary.50' : 'transparent',
                                opacity: active ? 1 : 0.55,
                                '&:hover': {
                                    backgroundColor: active ? 'primary.100' : 'action.hover',
                                },
                            }}
                        >
                            {channelIcon(channel)}
                        </IconButton>
                    </Tooltip>
                );
            })}
        </Stack>
    );

    return (
        <div>
            <Title
                text="Role - Notification"
                rightContent={(
                    <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={handleBack}>
                        Back to Role Master
                    </Button>
                )}
            />

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <TextField
                        label="Search roles"
                        value={roleFilter}
                        onChange={(event) => setRoleFilter(event.target.value)}
                        size="small"
                    />
                    <TextField
                        label="Search notifications"
                        value={notificationFilter}
                        onChange={(event) => setNotificationFilter(event.target.value)}
                        size="small"
                    />
                    <Box sx={{ flex: 1 }} />
                    <Button variant="outlined" onClick={() => setVisibleChannels(true)} disabled={!filteredRoles.length || !filteredNotifications.length}>
                        Enable visible
                    </Button>
                    <Button variant="outlined" color="warning" onClick={() => setVisibleChannels(false)} disabled={!filteredRoles.length || !filteredNotifications.length}>
                        Disable visible
                    </Button>
                    <Button variant="outlined" onClick={resetChanges} disabled={!hasUnsavedChanges}>
                        Reset Changes
                    </Button>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={`${gridData?.roles?.length ?? 0} roles`} size="small" />
                    <Chip label={`${gridData?.notifications?.length ?? 0} notifications`} size="small" />
                    <Chip
                        label={`${dirtyKeys.length} unsaved changes`}
                        size="small"
                        color={hasUnsavedChanges ? 'warning' : 'default'}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Icon clicks are local only. Click Save to persist changed EMAIL, IN_APP, and SMS mappings.
                    </Typography>
                </Stack>
            </Paper>

            {pending && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={28} />
                    <Typography sx={{ ml: 2 }}>Loading role notification mappings...</Typography>
                </Box>
            )}

            {!pending && (!gridData?.roles?.length || !gridData?.notifications?.length) && (
                <Alert severity="info">
                    Roles or active notification types are not available. Please add roles and notification master entries first.
                </Alert>
            )}

            {!pending && Boolean(gridData?.roles?.length) && Boolean(gridData?.notifications?.length) && (
                <TableContainer component={Paper} sx={{ maxHeight: '65vh', overflow: 'auto' }}>
                    <Table stickyHeader size="small" aria-label="Role notification channel mapping grid">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 4,
                                        minWidth: 260,
                                        backgroundColor: 'background.paper',
                                        fontWeight: 700,
                                    }}
                                >
                                    Notification Type
                                </TableCell>
                                {filteredRoles.map((role) => (
                                    <TableCell key={role.roleId} align="center" sx={{ minWidth: 150, fontWeight: 700 }}>
                                        {role.role}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredNotifications.map((notification) => (
                                <TableRow key={notification.notificationTypeId} hover>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 2,
                                            backgroundColor: 'background.paper',
                                            minWidth: 260,
                                            boxShadow: '2px 0 4px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight={600}>{notification.name}</Typography>
                                        {notification.code && <Typography variant="caption" color="text.secondary">{notification.code}</Typography>}
                                    </TableCell>
                                    {filteredRoles.map((role) => (
                                        <TableCell key={`${notification.notificationTypeId}-${role.roleId}`} align="center">
                                            {renderCell(role, notification)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={saveChanges}
                    disabled={saving || !hasUnsavedChanges}
                >
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </Stack>
        </div>
    );
};

export default RoleNotification;
