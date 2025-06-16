import axios from "axios";
import { BASE_URL } from "./api";

export function getEmployeeDetails(payload: string) {
    return axios.get(`${BASE_URL}/employees/${payload}`);
}

export function getAllEmployees() {
    return axios.get(`${BASE_URL}/employees`);
}

export function addEmployee(employee: any) {
    return axios.post(`${BASE_URL}/employees`, employee);
}

export function deleteEmployee(id: number) {
    return axios.delete(`${BASE_URL}/employees/${id}`);
}
