import axios from 'axios';
import { BASE_URL } from './api';

let severityCache: any[] | null = null;

export function getSeverities() {
    if (severityCache) {
        return Promise.resolve({ data: severityCache } as any);
    }
    return axios.get(`${BASE_URL}/severities`).then(res => {
        severityCache = res.data;
        return res;
    });
}
