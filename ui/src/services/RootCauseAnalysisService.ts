import axios from 'axios';
import { BASE_URL } from './api';

export function getRootCauseAnalysisTickets(page: number, size: number, username: string, roles: string[]) {
  const params = new URLSearchParams({ page: String(page), size: String(size), username });
  roles.forEach((role) => params.append('roles', role));
  return axios.get(`${BASE_URL}/root-cause-analysis/tickets?${params.toString()}`);
}

export function getRootCauseAnalysis(ticketId: string) {
  return axios.get(`${BASE_URL}/root-cause-analysis/${ticketId}`);
}

export function saveRootCauseAnalysis(ticketId: string, payload: FormData) {
  return axios.post(`${BASE_URL}/root-cause-analysis/${ticketId}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function deleteRootCauseAnalysisAttachment(ticketId: string, path: string, updatedBy?: string) {
  const params = new URLSearchParams({ path });
  if (updatedBy) {
    params.append('updatedBy', updatedBy);
  }
  return axios.delete(`${BASE_URL}/root-cause-analysis/${ticketId}/attachments?${params.toString()}`);
}
