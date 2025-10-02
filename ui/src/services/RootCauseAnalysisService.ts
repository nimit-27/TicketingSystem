import axios from 'axios';
import { RootCauseAnalysis } from '../types';
import { BASE_URL } from './api';

const extractPayload = (response: any): RootCauseAnalysis | null => {
  const rawPayload = response?.data ?? response;
  const body = rawPayload?.body ?? rawPayload;
  if (body && typeof body === 'object' && 'data' in body) {
    return (body.data ?? null) as RootCauseAnalysis | null;
  }
  return (body ?? null) as RootCauseAnalysis | null;
};

export function getRootCauseAnalysisTickets(page: number, size: number, username: string, roles: string[]) {
  const params = new URLSearchParams({ page: String(page), size: String(size), username });
  roles.forEach((role) => params.append('roles', role));
  return axios.get(`${BASE_URL}/root-cause-analysis/tickets?${params.toString()}`);
}

export function getRootCauseAnalysisTicketById(ticketId: string) {
  return axios.get(`${BASE_URL}/root-cause-analysis/tickets/${ticketId}`);
}

export async function getRootCauseAnalysis(ticketId: string): Promise<any | null> {
  const response = await axios.get(`${BASE_URL}/root-cause-analysis/${ticketId}`);
  return response;
  return extractPayload(response);
}

export async function saveRootCauseAnalysis(ticketId: string, payload: FormData): Promise<RootCauseAnalysis | null> {
  const response = await axios.post(`${BASE_URL}/root-cause-analysis/${ticketId}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return extractPayload(response);
}

export async function deleteRootCauseAnalysisAttachment(ticketId: string, path: string, updatedBy?: string): Promise<RootCauseAnalysis | null> {
  const params = new URLSearchParams({ path });
  if (updatedBy) {
    params.append('updatedBy', updatedBy);
  }
  const response = await axios.delete(`${BASE_URL}/root-cause-analysis/${ticketId}/attachments?${params.toString()}`);
  return extractPayload(response);
}
