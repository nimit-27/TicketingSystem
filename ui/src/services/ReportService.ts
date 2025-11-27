import axios from "./apiClient";
import { BASE_URL } from "./api";
import { MISReportRequestParams, SupportDashboardSummaryRequestParams } from "../types/reports";

export function fetchSupportDashboardSummary(params?: SupportDashboardSummaryRequestParams) {
    return axios.get(`${BASE_URL}/reports/support-dashboard-summary`, { params });
}

export function fetchTicketSummaryReport(params?: MISReportRequestParams) {
    return axios.get(`${BASE_URL}/reports/ticket-summary`, { params });
}

export function fetchTicketResolutionTimeReport(params?: MISReportRequestParams) {
    return axios.get(`${BASE_URL}/reports/resolution-time`, { params });
}

export function fetchCustomerSatisfactionReport(params?: MISReportRequestParams) {
    return axios.get(`${BASE_URL}/reports/customer-satisfaction`, { params });
}

export function fetchProblemManagementReport(params?: MISReportRequestParams) {
    return axios.get(`${BASE_URL}/reports/problem-management`, { params });
}

export function fetchSlaPerformanceReport(params?: MISReportRequestParams) {
    return axios.get(`${BASE_URL}/reports/sla-performance`, { params });
}

export function notifyBreachedTicketAssignees() {
    return axios.post(`${BASE_URL}/reports/sla-performance/notify-breaches`);
}
