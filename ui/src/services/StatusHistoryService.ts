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
    // Avoid a custom header because deployed CORS policies only allow the
    // application's standard headers during the PATCH preflight.
    return axios.patch(`${BASE_URL}/status-history/${historyId}/timestamp?devMode=true`, update);
}

export function previewStatusTimestamp(historyId: string, update: StatusTimestampUpdate) {
    return axios.post(`${BASE_URL}/status-history/${historyId}/timestamp/preview?devMode=true`, update);
}
