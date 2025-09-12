import axios from 'axios';
import { BASE_URL } from './api';

export function getStatusListFromApi() {
    return axios.get(`${BASE_URL}/ticket-statuses`);
}

export function getNextStatusListByStatusId(statusId: string) {
    return axios.get(`${BASE_URL}/status-workflow/status/${statusId}`);
}

export function getStatusWorkflowMappings(roles: string[]) {
    return axios.post(`${BASE_URL}/status-workflow/mappings`, roles);
}

export function getStatusActions() {
    return axios.get(`${BASE_URL}/status-workflow/actions`);
}

export function getAllowedStatusListByRoles(roles: string[]) {
    return axios.post(`${BASE_URL}/status-workflow/allowed-statuses`, roles);
}
