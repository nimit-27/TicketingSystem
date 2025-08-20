import axios from 'axios';
import { BASE_URL } from './api';
import { PriorityInfo } from '../types';

let priorityCache: PriorityInfo[] | null = null;

export function getPriorities() {
    if (priorityCache) {
        return Promise.resolve({ data: priorityCache } as any);
    }
    return axios.get<PriorityInfo[]>(`${BASE_URL}/priorities`).then(res => {
        priorityCache = res.data;
        return res;
    });
}
