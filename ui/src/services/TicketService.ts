import axios from "axios";

let baseURL = "http://localhost:8081";

export function searchTickets(payload: string) {
    console.log("searchTickets called with payload:", payload);
    return axios.post(`${baseURL}/tickets`, payload)
}

export function addTicket(payload: string) {
    console.log("addTicket called with payload:", payload);
    return axios.post(`${baseURL}/tickets/add`, payload)
}

export function getTickets() {
    console.log("getTickets called");
    return axios.get(`${baseURL}/tickets`);
}