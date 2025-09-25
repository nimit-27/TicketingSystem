import axios from "axios";
import { BASE_URL } from "./api";

export function getAllRoles() {
    return axios.get(`${BASE_URL}/roles`);
}

export function getRoleSummaries() {
    return axios.get(`${BASE_URL}/roles/summaries`);
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

export function updateRole(role: string, body: any) {
    return axios.put(`${BASE_URL}/roles/${role}`, body);
}

export function renameRole(oldRole: string, newRole: string, updatedBy: string | undefined) {
    return axios.put(`${BASE_URL}/roles/${oldRole}/rename`, { role: newRole, updatedBy });
}

export function loadPermissions() {
    return axios.post(`${BASE_URL}/permissions/load`);
}

export function deleteRoles(ids: string[], hard?: boolean) {
    return axios.delete(`${BASE_URL}/roles`, { params: { ids, hard } });
}

export function deleteRole(id: string, hard?: boolean) {
    return axios.delete(`${BASE_URL}/roles/${id}`, { params: { hard } });
}
