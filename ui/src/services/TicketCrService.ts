import apiClient from "./apiClient";
import { BASE_URL } from "./api";

export function getChangeRequests() {
    return apiClient.get(`${BASE_URL}/ticket-cr`);
}

export function getCrStatusMasterList() {
    return apiClient.get(`${BASE_URL}/cr-status-master`);
}

export function createChangeRequest(payload: any) {
    return apiClient.post(`${BASE_URL}/ticket-cr`, payload);
}

export function getChangeRequestById(ticketCrId: string) {
    return apiClient.get(`${BASE_URL}/ticket-cr/${ticketCrId}`);
}
