import axios from 'axios';
import { BASE_URL } from './api';

export function getDivisionHistory(ticketId: string) {
    return axios.get(`${BASE_URL}/division-history/${ticketId}`);
}
