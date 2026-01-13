import axios from "axios";
import { ANNADARPAN_KEYCLOAK_URL, BASE_URL } from "./api";
import { SsoLoginPayload, LoginPayload } from "../types/auth";

export function loginUser(payload: LoginPayload) {
    return axios.post(`${BASE_URL}/auth/login`, payload, { withCredentials: true });
}

export function logoutUser() {
    return axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true });
}

export function loginSso(payload: SsoLoginPayload) {
    return axios.post(`${BASE_URL}/auth/sso`, payload, { withCredentials: true });
}

// export function getExternalApplicationToken(payload: SsoLoginPayload) {
//     return axios.post(`${ANNADARPAN_KEYCLOAK_URL}/getExternalApplicationToken`, payload)
// }
