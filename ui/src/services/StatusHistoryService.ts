import axios from 'axios';
import { BASE_URL } from './api';

export function getStatusHistory(ticketId: number) {
    return axios.get(`${BASE_URL}/status-history/${ticketId}`);
}
