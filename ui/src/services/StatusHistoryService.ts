import axios from 'axios';
import { BASE_URL } from './api';

export function getStatusHistory(ticketId: string) {
    return axios.get(`${BASE_URL}/status-history/${ticketId}`);
}
