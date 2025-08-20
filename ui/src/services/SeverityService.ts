import axios from 'axios';
import { BASE_URL } from './api';
import { SeverityInfo } from '../types';

let severityCache: SeverityInfo[] | null = null;

export function getSeverities() {
    if (severityCache) {
        return Promise.resolve({ data: severityCache } as any);
    }
    return axios.get<SeverityInfo[]>(`${BASE_URL}/severities`).then(res => {
        severityCache = res.data;
        return res;
    });
}
