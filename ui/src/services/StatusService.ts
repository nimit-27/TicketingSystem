import axios from 'axios';
import { BASE_URL } from './api';

let statusCache: any[] | null = null;

export function getStatuses() {
    if (statusCache) {
        return Promise.resolve({ data: statusCache } as any);
    }
    return axios.get(`${BASE_URL}/ticket-statuses`).then(res => {
        statusCache = res.data;
        return res;
    });
}
