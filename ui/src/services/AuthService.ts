import axios from "axios";
import { BASE_URL } from "./api";

export function loginEmployee(payload: { userId: string; password: string }) {
    return axios.post(`${BASE_URL}/auth/login`, payload, { withCredentials: true });
}

export function logoutEmployee() {
    return axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true });
}
