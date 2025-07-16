import axios from 'axios';
import { BASE_URL } from './api';

export function getAssignmentHistory(ticketId: string) {
    return axios.get(`${BASE_URL}/assignment-history/${ticketId}`);
}
