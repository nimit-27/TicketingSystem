import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SmsIcon from '@mui/icons-material/Sms';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import { useApi } from '../hooks/useApi';
import { useSnackbar } from '../context/SnackbarContext';
import { NotificationChannel } from '../services/RoleNotificationChannelService';
import {
    getNotificationChannelSettings,
    NotificationChannelSettings,
    updateNotificationChannelSettings,
} from '../services/NotificationChannelSettingsService';

// NOTIFICATION_MASTER_CHANGE: Describe the three channels controlled for the whole application.
const CHANNELS: Array<{
    code: NotificationChannel;
    label: string;
    description: string;
    icon: React.ReactNode;
}> = [
    {
        code: 'IN_APP',
        label: 'In-app notifications',
        description: 'Controls notification bell messages and real-time in-application alerts.',
        icon: <NotificationsActiveIcon color="primary" />,
    },
    {
        code: 'EMAIL',
        label: 'Email notifications',
        description: 'Controls all application-generated notification emails and queued email delivery.',
        icon: <EmailIcon color="primary" />,
    },
    {
        code: 'SMS',
        label: 'SMS notifications',
        description: 'Controls all application-generated text messages.',
        icon: <SmsIcon color="primary" />,
    },
];

// NOTIFICATION_MASTER_CHANGE: Provide a dedicated admin workflow for application-wide channel enable/disable.
const NotificationMaster: React.FC = () => {
    const navigate = useNavigate();
    const { showMessage } = useSnackbar();
    const { data, pending, apiHandler } = useApi<NotificationChannelSettings>();
    const { pending: saving, apiHandler: saveApiHandler } = useApi<NotificationChannelSettings>();
    const [settings, setSettings] = useState<NotificationChannelSettings | null>(null);

    useEffect(() => {
        apiHandler(() => getNotificationChannelSettings());
    }, []);

    useEffect(() => {
        if (data) setSettings(data);
    }, [data]);

    const hasChanges = useMemo(() => (
        Boolean(settings && data && CHANNELS.some(({ code }) => settings[code] !== data[code]))
    ), [data, settings]);

    const toggleChannel = (channel: NotificationChannel) => {
        setSettings((current) => current ? { ...current, [channel]: !current[channel] } : current);
    };

    const save = async () => {
        if (!settings) return;
        const saved = await saveApiHandler(() => updateNotificationChannelSettings(settings));
        if (!saved) return;
        setSettings(saved);
        showMessage('Application notification channels updated successfully.', 'success');
        apiHandler(() => getNotificationChannelSettings());
    };

    return (
        <div>
            <Title
                text="Notification Master"
                rightContent={(
                    <Button variant="outlined" onClick={() => navigate('/role-master/notifications')}>
                        Role - Notification
                    </Button>
                )}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
                These switches apply to the whole application. A disabled channel will not send notifications even when it is enabled for a role.
            </Alert>

            {pending && !settings && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={30} />
                </Box>
            )}

            {settings && (
                <Stack spacing={2}>
                    {CHANNELS.map((channel) => (
                        <Paper key={channel.code} variant="outlined" sx={{ p: 2.5 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                {channel.icon}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6">{channel.label}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {channel.description}
                                    </Typography>
                                </Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography
                                        variant="body2"
                                        color={settings[channel.code] ? 'success.main' : 'text.secondary'}
                                        fontWeight={600}
                                    >
                                        {settings[channel.code] ? 'Enabled' : 'Disabled'}
                                    </Typography>
                                    <Switch
                                        checked={settings[channel.code]}
                                        onChange={() => toggleChannel(channel.code)}
                                        inputProps={{ 'aria-label': `${channel.label} application-wide toggle` }}
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" disabled={!hasChanges} onClick={() => setSettings(data ?? null)}>
                    Reset Changes
                </Button>
                <Button variant="contained" disabled={!hasChanges || saving} onClick={save}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </Stack>
        </div>
    );
};

export default NotificationMaster;
