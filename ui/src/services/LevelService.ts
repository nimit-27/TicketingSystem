import axios from "axios";

let baseURL = "http://localhost:8081";

export function getAllLevels() {
    console.log("getAllEmployees called");
    return axios.get(`${baseURL}/levels`);
}

export function getAllEmployeesByLevel(payload: string) {
    console.log("getAllEmployees called");
    return axios.get(`${baseURL}/levels/${payload}/employees`);
}