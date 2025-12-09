import axios from 'axios';
import { BASE_URL } from './api';
import { ParameterMaster } from "../types/parameters";

export function getParameters() {
    return axios.get(`${BASE_URL}/parameters`);
}

export function getParametersByRoles(roleIds: string[]) {
    return axios.post<ParameterMaster[]>(`${BASE_URL}/parameters/by-roles`, roleIds);
}
