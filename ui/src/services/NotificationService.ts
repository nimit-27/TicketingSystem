import apiClient from './apiClient';
import { BASE_URL } from './api';

export function getNotifications(page = 0, size = 7) {
  return apiClient.get(`${BASE_URL}/notifications`, { params: { page, size } });
}

export function markNotificationsAsRead() {
  return apiClient.post(`${BASE_URL}/notifications/mark-read`, {});
}
