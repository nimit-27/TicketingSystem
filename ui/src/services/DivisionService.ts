import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from './api';
import { DivisionInfo } from '../types';

const normalizeDivisionData = (data: any): DivisionInfo[] => {
    if (Array.isArray(data)) {
        return data as DivisionInfo[];
    }
    if (Array.isArray(data?.body?.data)) {
        return data.body.data as DivisionInfo[];
    }
    return [];
};

export function getDivisions() {
    return axios.get(`${BASE_URL}/divisions`).then((res: AxiosResponse<any>) => ({
        ...res,
        data: normalizeDivisionData(res.data),
    }) as AxiosResponse<DivisionInfo[]>);
}
