import axios from 'axios';
import { BASE_URL } from './api';

export function initFilegatorSession(username: string, password: string) {
    return axios.post(`${BASE_URL}/filegator/login`, { username, password }, { withCredentials: true });
}
