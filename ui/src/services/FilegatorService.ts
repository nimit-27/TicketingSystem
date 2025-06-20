import axios from 'axios';
import { BASE_URL } from './api';

export function initFilegatorSession() {
    return axios.post(`${BASE_URL}/filegator/login`, null, { withCredentials: true });
}
