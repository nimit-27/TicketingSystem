import axios from 'axios';
import { BASE_URL } from './api';
import { NotificationChannel } from './RoleNotificationChannelService';

// NOTIFICATION_MASTER_CHANGE: Define and expose the application-wide channel settings API contract.
export type NotificationChannelSettings = Record<NotificationChannel, boolean>;

export function getNotificationChannelSettings() {
    return axios.get(`${BASE_URL}/notification-channel-settings`);
}

export function updateNotificationChannelSettings(channels: NotificationChannelSettings) {
    return axios.put(`${BASE_URL}/notification-channel-settings`, { channels });
}
