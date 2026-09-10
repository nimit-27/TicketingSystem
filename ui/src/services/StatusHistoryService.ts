import axios from 'axios';
import { BASE_URL } from './api';

export function getStatusHistory(ticketId: string) {
    return axios.get(`${BASE_URL}/status-history/${ticketId}`);
}

export function updateStatusTimestamp(historyId: string, payload: { timestamp?: string; addMinutes?: number }) {
    return axios.patch(`${BASE_URL}/status-history/${historyId}/timestamp`, payload);
}
