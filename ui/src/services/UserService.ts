import axios from "axios";
import { BASE_URL } from "./api";
import { HelpdeskUser, RequesterUser } from "../types/users";

export interface CreateUserPayload {
    username: string;
    name: string;
    emailId: string;
    mobileNo: string;
    office: string;
    password: string;
    roleIds: string[];
    levelIds: string[];
    stakeholderIds: string[];
}

export function getUserDetails(payload: string) {
    return axios.get(`${BASE_URL}/users/${payload}`);
}

export function getAllUsers() {
    return axios.get(`${BASE_URL}/users`);
}

export function getHelpdeskUsers() {
    return axios.get<HelpdeskUser[]>(`${BASE_URL}/users/helpdesk`);
}

export function getHelpdeskUserDetails(userId: string) {
    return axios.get<HelpdeskUser>(`${BASE_URL}/users/helpdesk/${userId}`);
}

export function getRequesterUsers() {
    return axios.get<RequesterUser[]>(`${BASE_URL}/users/requesters`);
}

export function getRequesterUserDetails(userId: string) {
    return axios.get<RequesterUser>(`${BASE_URL}/users/requesters/${userId}`);
}

export function getUsersByRoles(roleIds: string[]) {
    return axios.post(`${BASE_URL}/users/by-roles`, roleIds);
}

export function addUser(user: any) {
    return axios.post(`${BASE_URL}/users`, user);
}

export function createUser(user: CreateUserPayload) {
    return axios.post(`${BASE_URL}/users/admin`, user);
}

export function deleteUser(id: string) {
    return axios.delete(`${BASE_URL}/users/${id}`);
}
