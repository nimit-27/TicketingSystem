import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from './api';
import { IssueTypeInfo } from '../types';

let issueTypeCache: IssueTypeInfo[] | null = null;

const normalizeIssueTypeData = (data: any): IssueTypeInfo[] => {
    if (Array.isArray(data)) {
        return data as IssueTypeInfo[];
    }
    if (data?.body?.data && Array.isArray(data.body.data)) {
        return data.body.data as IssueTypeInfo[];
    }
    return [];
};

export function getIssueTypes() {
    if (issueTypeCache) {
        return Promise.resolve({ data: issueTypeCache } as { data: IssueTypeInfo[] });
    }
    return axios.get(`${BASE_URL}/issue-types`).then((res: AxiosResponse<any>) => {
        const issueTypeData = normalizeIssueTypeData(res.data);
        issueTypeCache = issueTypeData;
        return { ...res, data: issueTypeData } as AxiosResponse<IssueTypeInfo[]>;
    });
}
