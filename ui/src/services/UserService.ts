import axios from "axios";
import { BASE_URL } from "./api";

export function getUserDetails(payload: string) {
    return axios.get(`${BASE_URL}/users/${payload}`);
}

export function getAllUsers() {
    return axios.get(`${BASE_URL}/users`);
}

export function getUsersByRoles(roleIds: string[]) {
    return axios.post(`${BASE_URL}/users/by-roles`, roleIds);
}

export function addUser(user: any) {
    return axios.post(`${BASE_URL}/users`, user);
}

export function deleteUser(id: string) {
    return axios.delete(`${BASE_URL}/users/${id}`);
}
