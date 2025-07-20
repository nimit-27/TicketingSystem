import axios from 'axios';
import { BASE_URL } from './api';

export function savePermissions(config: any) {
    return axios.post(`${BASE_URL}/permissions`, config);
}

export function getAllPermissions() {
    return axios.get(`${BASE_URL}/permissions`);
}

export function getRolePermission(role: string) {
    return axios.get(`${BASE_URL}/permissions/${role}`);
}

export function updateRolePermission(role: string, perm: any) {
    return axios.put(`${BASE_URL}/permissions/${role}`, perm);
}
