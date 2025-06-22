import axios from 'axios';
import { BASE_URL } from './api';

let priorityCache: any[] | null = null;

export function getPriorities() {
    if (priorityCache) {
        return Promise.resolve({ data: priorityCache } as any);
    }
    return axios.get(`${BASE_URL}/priorities`).then(res => {
        priorityCache = res.data;
        return res;
    });
}
