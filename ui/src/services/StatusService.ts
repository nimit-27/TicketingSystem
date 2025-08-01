import axios from 'axios';
import { BASE_URL } from './api';
import { getStatusList, setStatusList } from '../utils/Utils';

let statusCache: any[] | null = null;

export function getStatusListFromApi() {
    return axios.get(`${BASE_URL}/ticket-statuses`)
}

export function getStatuses() {
    if (statusCache) {
        return Promise.resolve({ data: statusCache } as any);
    }
    const stored = getStatusList();
    if (stored) {
        statusCache = stored;
        return Promise.resolve({ data: stored } as any);
    }
    return getStatusListFromApi().then(res => {
        statusCache = res.data.body.data;
        setStatusList(res.data.body.data);
        return res;
    });
}

export function getNextStatusListByStatusId(statusId: string) {
    return axios.get(`${BASE_URL}/next-status-list/${statusId}`);
}
