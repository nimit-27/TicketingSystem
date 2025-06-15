import axios from "axios";
import { BASE_URL } from "./api";

export function getEmployeeDetails(payload: string) {
    return axios.get(`${BASE_URL}/employees/${payload}`);
}

export function getAllEmployees() {
    return axios.get(`${BASE_URL}/employees`);
}
