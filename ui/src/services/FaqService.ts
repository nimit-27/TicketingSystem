import axios from 'axios';
import { BASE_URL } from './api';

export function getFaqs() {
  return axios.get(`${BASE_URL}/faqs`);
}

export function createFaq(faq: any) {
  return axios.post(`${BASE_URL}/faqs`, faq);
}

