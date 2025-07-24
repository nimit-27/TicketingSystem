import axios from "axios";
import { BASE_URL } from "./api";

export function getAllRoles() {
    return axios.get(`${BASE_URL}/roles`);
}