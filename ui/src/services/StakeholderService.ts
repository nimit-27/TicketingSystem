import axios from 'axios';
import { BASE_URL } from './api';

let stakeholderCache: any[] | null = null;

export function getStakeholders() {
    if (stakeholderCache) {
        return Promise.resolve({ data: stakeholderCache } as any);
    }
    return axios.get(`${BASE_URL}/stakeholders`).then(res => {
        stakeholderCache = res.data;
        return res;
    });
}
