import axios from "axios";
import { BASE_URL } from "./api";

export interface LoginPayload {
    username: string;
    password: string;
    portal?: string;
}

export function loginUser(payload: LoginPayload) {
    return axios.post(`${BASE_URL}/auth/login`, payload, { withCredentials: true });
}

export function logoutUser() {
    return axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true });
}
