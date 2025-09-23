import axios from 'axios';
import { BASE_URL } from './api';

export function fetchNotifications(page = 0, size = 7) {
  return axios.get(`${BASE_URL}/notifications`, {
    params: { page, size },
    withCredentials: true,
  });
}

export function markNotificationsAsRead() {
  return axios.post(
    `${BASE_URL}/notifications/mark-read`,
    {},
    { withCredentials: true }
  );
}
