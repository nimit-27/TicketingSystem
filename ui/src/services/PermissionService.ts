import axios from 'axios';
import { BASE_URL } from './api';

export function savePermissions(config: any) {
    return axios.post(`${BASE_URL}/permissions`, config);
}
