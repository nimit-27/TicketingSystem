import axios from 'axios';
import { BASE_URL } from './api';

export function getAssignmentHistory(ticketId: number) {
    return axios.get(`${BASE_URL}/assignment-history/${ticketId}`);
}
