import axios from "axios";
import { BASE_URL } from "./api";

export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'SMS';

export interface RoleNotificationRole {
    roleId: number;
    role: string;
}

export interface RoleNotificationType {
    notificationTypeId: number;
    name: string;
    code?: string;
    description?: string;
}

export interface RoleNotificationMappingState {
    roleId: number;
    notificationTypeId: number;
    channels: Record<NotificationChannel, boolean>;
}

export interface RoleNotificationGridResponse {
    roles: RoleNotificationRole[];
    notifications: RoleNotificationType[];
    mappings: RoleNotificationMappingState[];
}

export interface RoleNotificationBatchUpdateItem {
    roleId: number;
    notificationTypeId: number;
    channelCode: NotificationChannel;
    isActive: boolean;
}

export interface RoleNotificationBatchUpdateRequest {
    updatedBy?: string;
    items: RoleNotificationBatchUpdateItem[];
}

export function getRoleNotificationChannelGrid() {
    return axios.get(`${BASE_URL}/role-notification-channel-mappings`);
}

export function updateRoleNotificationChannels(body: RoleNotificationBatchUpdateRequest) {
    return axios.put(`${BASE_URL}/role-notification-channel-mappings/batch`, body);
}
