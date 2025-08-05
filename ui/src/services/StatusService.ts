import axios from 'axios';
import { BASE_URL } from './api';

export function getStatusListFromApi() {
    return axios.get(`${BASE_URL}/ticket-statuses`);
}

export function getNextStatusListByStatusId(statusId: string) {
    return axios.get(`${BASE_URL}/status-workflow/status/${statusId}`);
}
