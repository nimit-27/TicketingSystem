import axios from "./apiClient";
import { BASE_URL } from "./api";

export function fetchTicketSummaryReport() {
    return axios.get(`${BASE_URL}/reports/ticket-summary`);
}

export function fetchTicketResolutionTimeReport() {
    return axios.get(`${BASE_URL}/reports/resolution-time`);
}

export function fetchCustomerSatisfactionReport() {
    return axios.get(`${BASE_URL}/reports/customer-satisfaction`);
}

export function fetchProblemManagementReport() {
    return axios.get(`${BASE_URL}/reports/problem-management`);
}
