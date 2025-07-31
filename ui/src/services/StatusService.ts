import axios from 'axios';
import { BASE_URL } from './api';
import { getStatusList, setStatusList } from '../utils/Utils';

let statusCache: any[] | null = null;

export function getStatuses() {
    if (statusCache) {
        return Promise.resolve({ data: statusCache } as any);
    }
    const stored = getStatusList();
    if (stored) {
        statusCache = stored;
        return Promise.resolve({ data: stored } as any);
    }
    return axios.get(`${BASE_URL}/ticket-statuses`).then(res => {
        statusCache = res.data;
        setStatusList(res.data);
        return res;
    });
}
