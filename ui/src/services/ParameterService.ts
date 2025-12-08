import axios from 'axios';
import { BASE_URL } from './api';

export function getParameters() {
    return axios.get(`${BASE_URL}/parameters`);
}
