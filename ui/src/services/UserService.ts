import axios from "axios";

let baseURL = "http://localhost:8081";

export function getEmployeeDetails(payload: string) {
    console.log("getEmployeeDetails called:", payload);
    return axios.get(`${baseURL}/employees/${payload}`);
}

export function searchEmployees(query: string, stakeholder?: string) {
    const params: any = { q: query };
    if (stakeholder) params.stakeholder = stakeholder;
    return axios.get(`${baseURL}/employees`, { params });
}