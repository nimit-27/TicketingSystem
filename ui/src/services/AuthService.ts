import axios from "axios";
import { BASE_URL } from "./api";

export function loginUser(payload: { username: string; password: string; roles: string[] }) {
    return axios.post(`${BASE_URL}/auth/login`, payload, { withCredentials: true });
}

export function logoutUser() {
    return axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true });
}
