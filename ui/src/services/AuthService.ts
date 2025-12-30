import axios from "axios";
import { ANNADARPAN_KEYCLOAK_URL, BASE_URL } from "./api";
import { ExternalApplicationTokenPayload, LoginPayload } from "../types/auth";

export function loginUser(payload: LoginPayload) {
    return axios.post(`${BASE_URL}/auth/login`, payload, { withCredentials: true });
}

export function logoutUser() {
    return axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true });
}

export function getExternalApplicationToken(payload: ExternalApplicationTokenPayload) {
    return axios.post(`${ANNADARPAN_KEYCLOAK_URL}/getExternalApplicationToken`, payload)
}