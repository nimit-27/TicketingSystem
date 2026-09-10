import axios from 'axios';
import { BASE_URL } from './api';

export function getStatusHistory(ticketId: string) {
    return axios.get(`${BASE_URL}/status-history/${ticketId}`);
}

export interface StatusTimestampUpdate {
    timestamp?: string;
    addMinutes?: number;
}

export function updateStatusTimestamp(historyId: string, update: StatusTimestampUpdate) {
    return axios.patch(`${BASE_URL}/status-history/${historyId}/timestamp`, update, {
        headers: { 'X-Dev-Mode': 'true' },
    });
}
