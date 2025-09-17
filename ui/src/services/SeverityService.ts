import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from './api';
import { SeverityInfo } from '../types';

let severityCache: SeverityInfo[] | null = null;

const normalizeSeverityData = (data: any): SeverityInfo[] => {
    if (Array.isArray(data)) {
        return data as SeverityInfo[];
    }
    if (data?.body?.data && Array.isArray(data.body.data)) {
        return data.body.data as SeverityInfo[];
    }
    return [];
};

export function getSeverities() {
    if (severityCache) {
        return Promise.resolve({ data: severityCache } as { data: SeverityInfo[] });
    }
    return axios.get(`${BASE_URL}/severities`).then((res: AxiosResponse<any>) => {
        const severityData = normalizeSeverityData(res.data);
        severityCache = severityData;
        return { ...res, data: severityData } as AxiosResponse<SeverityInfo[]>;
    });
}
