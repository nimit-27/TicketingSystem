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

export function getTicketsMissingChangeRequest() {
    return apiClient.get(`${BASE_URL}/ticket-cr/missing`);
}

export function createMissingChangeRequest(ticketId: string, updatedBy?: string) {
    return apiClient.post(`${BASE_URL}/ticket-cr/missing/${ticketId}`, { updatedBy });
}

export function createAllMissingChangeRequests(updatedBy?: string) {
    return apiClient.post(`${BASE_URL}/ticket-cr/missing`, { updatedBy });
}

export function getChangeRequestById(ticketCrId: string) {
    return apiClient.get(`${BASE_URL}/ticket-cr/${ticketCrId}`);
}

export function getChangeRequestActions(crStatusId: string) {
    return apiClient.get(`${BASE_URL}/ticket-cr/actions/${crStatusId}`);
}

export function updateChangeRequestStatus(ticketCrId: string, payload: any) {
    return apiClient.patch(`${BASE_URL}/ticket-cr/${ticketCrId}/status`, payload);
}

export function getCrStatusWorkflowMappings(roles: string[]) {
    return apiClient.post(`${BASE_URL}/ticket-cr/mappings`, roles);
}

export function getChangeRequestHistory(ticketCrId: string, changeTypeCode?: string) {
    return apiClient.get(`${BASE_URL}/ticket-cr/${ticketCrId}/history`, { params: changeTypeCode ? { changeTypeCode } : undefined });
}
