import axios from "axios";
import { BASE_URL } from "./api";

export function getAllRoles() {
    return axios.get(`${BASE_URL}/roles`);
}

export function addRole(body: any) {
    return axios.post(`${BASE_URL}/roles`, body);
}

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

export function loadPermissions() {
    return axios.post(`${BASE_URL}/permissions/load`);
}
