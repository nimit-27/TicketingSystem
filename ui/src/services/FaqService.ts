import axios from 'axios';
import { BASE_URL } from './api';

export function getFaqs() {
  return axios.get(`${BASE_URL}/faqs`);
}

export function getFaqById(id: string) {
  return axios.get(`${BASE_URL}/faqs/${id}`);
}

export function createFaq(faq: any) {
  return axios.post(`${BASE_URL}/faqs`, faq);
}

export function updateFaq(id: string, faq: any) {
  return axios.put(`${BASE_URL}/faqs/${id}`, faq);
}

