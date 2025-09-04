import axios from 'axios';
import { BASE_URL } from './api';
import apiClient from './apiClient';

export type SubmitFeedbackRequest = {
  overallSatisfaction: number;
  resolutionEffectiveness: number;
  communicationSupport: number;
  timeliness: number;
  comments?: string;
};

export function getFeedbackForm(ticketId: string) {
  return apiClient.get(`${BASE_URL}/tickets/${ticketId}/feedback/form`);
}

export function submitFeedback(ticketId: string, body: SubmitFeedbackRequest) {
  return apiClient.post(`${BASE_URL}/tickets/${ticketId}/feedback`, body);
}

export function getFeedback(ticketId: string) {
  return apiClient.get(`${BASE_URL}/tickets/${ticketId}/feedback`);
}
