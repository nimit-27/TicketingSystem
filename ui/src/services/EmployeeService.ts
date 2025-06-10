import axios from "axios";

let baseURL = "http://localhost:8081";

export function getEmployeeDetails (payload: string) {
    console.log("getEmployeeDetails called:", payload);
    return axios.get(`${baseURL}/employees/${payload}`)
}

export function getAllEmployees() {
    console.log("getAllEmployees called");
    return axios.get(`${baseURL}/employees`);
}
