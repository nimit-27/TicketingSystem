import axios from 'axios';
import { BASE_URL } from './api';

export function fetchNotifications() {
  return axios.get(`${BASE_URL}/notifications`, { withCredentials: true });
}
