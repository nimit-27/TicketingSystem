import axios from "axios";
import { BASE_URL } from "./api";
import { CreateComment } from "../components/Comments/CommentsSection";

export function searchTickets(payload: string) {
    return axios.post(`${BASE_URL}/tickets`, payload);
}

export function addTicket(payload: any) {
    const config = payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
    return axios.post(`${BASE_URL}/tickets/add`, payload, config);
}

export function addAttachments(id: string, files: File[] | FileList) {
    const formData = new FormData();
    Array.from<File>(files).forEach(file => {
        const normalizedName = file.name.replace(/\s+/g, '_');
        const normalizedFile = normalizedName === file.name
            ? file
            : new File([file], normalizedName, { type: file.type, lastModified: file.lastModified });
        formData.append('attachments', normalizedFile);
    });
    return axios.post(`${BASE_URL}/tickets/${id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}

export function getAttachmentsByTicketId(ticketId: string) {
    return axios.get(`${BASE_URL}/tickets/${ticketId}/attachments`);
}

export function deleteAttachment(id: string, path: string) {
    return axios.delete(`${BASE_URL}/tickets/${id}/attachments`, {
        params: { path }
    });
}

export function getTickets(page: number = 0, size: number = 5) {
    return axios.get(`${BASE_URL}/tickets?page=${page}&size=${size}`);
}

export function getTicket(id: string) {
    return axios.get(`${BASE_URL}/tickets/${id}`);
}

export function getTicketSla(id: string) {
    return axios.get(`${BASE_URL}/tickets/${id}/sla`);
}

export function updateTicket(id: string, payload: any) {
    return axios.put(`${BASE_URL}/tickets/${id}`, payload)
}

export function linkTicketToMaster(id: string, masterId: string, updatedBy?: string) {
    return axios.put(
        `${BASE_URL}/tickets/${id}/link/${masterId}`,
        null,
        updatedBy ? { params: { updatedBy } } : undefined
    );
}

export function makeTicketMaster(id: string) {
    return axios.put(`${BASE_URL}/tickets/${id}/master`);
}

export function unlinkTicketFromMaster(id: string, updatedBy?: string) {
    return axios.put(
        `${BASE_URL}/tickets/${id}/unlink`,
        null,
        updatedBy ? { params: { updatedBy } } : undefined
    );
}

export function getChildTickets(masterId: string) {
    return axios.get(`${BASE_URL}/tickets/${masterId}/children`);
}

export function addComment(id: string, comment: CreateComment) {
    return axios.post(`${BASE_URL}/tickets/${id}/comments`, comment);
}

export function getComments(id: string, count?: number) {
    const url = count ? `${BASE_URL}/tickets/${id}/comments?count=${count}` : `${BASE_URL}/tickets/${id}/comments`;
    return axios.get(url);
}

export function updateComment(commentId: string, comment: string) {
    return axios.put(`${BASE_URL}/tickets/comments/${commentId}`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export function deleteComment(commentId: string) {
    return axios.delete(`${BASE_URL}/tickets/comments/${commentId}`);
}

export function searchTicketsPaginated(
    query: string,
    statusName?: string,
    master?: string,
    assignedBackFromFci?: boolean,
    page: number = 0,
    size: number = 5,
    assignedTo?: string,
    levelId?: string,
    assignedBy?: string,
    requestorId?: string,
    sortBy?: string,
    direction?: string,
    severity?: string,
    createdBy?: string,
    dateParam?: string,
    fromDate?: string,
    toDate?: string,
    categoryId?: string,
    subCategoryId?: string,
    zoneCode?: string,
    regionCode?: string,
    districtCode?: string,
    issueTypeId?: string,
    divisionId?: string,
    breachOption?: string,
    breachInMinutes?: number,
    breachedOnFromDate?: string,
    breachedOnToDate?: string,
    lastModifiedStatusFromDate?: string,
    lastModifiedStatusToDate?: string,
) {
    const params = new URLSearchParams({ query, page: String(page), size: String(size) });
    if (statusName) params.append('status', statusName);
    if (master !== undefined) params.append('master', String(master));
    if (assignedBackFromFci !== undefined) params.append('assignedBackFromFci', String(assignedBackFromFci));
    if (assignedTo) params.append('assignedTo', assignedTo);
    if (levelId) params.append('levelId', levelId);
    if (assignedBy) params.append('assignedBy', assignedBy);
    if (requestorId) params.append('requestorId', requestorId);
    if (sortBy) params.append('sortBy', sortBy);
    if (direction) params.append('direction', direction);
    if (severity) params.append('severity', severity);
    if (createdBy) params.append('createdBy', createdBy);
    if (dateParam) params.append('dateParam', dateParam);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (categoryId) params.append('category', categoryId);
    if (subCategoryId) params.append('subCategory', subCategoryId);
    if (zoneCode) params.append('zoneCode', zoneCode);
    if (regionCode) params.append('regionCode', regionCode);
    if (districtCode) params.append('districtCode', districtCode);
    if (issueTypeId) params.append('issueTypeId', issueTypeId);
    if (divisionId) params.append('divisionId', divisionId);
    if (breachOption) params.append('breachOption', breachOption);
    if (breachInMinutes !== undefined) params.append('breachInMinutes', String(breachInMinutes));
    if (breachedOnFromDate) params.append('breachedOnFromDate', breachedOnFromDate);
    if (breachedOnToDate) params.append('breachedOnToDate', breachedOnToDate);
    if (lastModifiedStatusFromDate) params.append('lastModifiedStatusFromDate', lastModifiedStatusFromDate);
    if (lastModifiedStatusToDate) params.append('lastModifiedStatusToDate', lastModifiedStatusToDate);
    return axios.get(`${BASE_URL}/tickets/search?${params.toString()}`);
}


export function downloadTicketsReport({
    reportCode,
    format,
    fromDate,
    dateParam,
    toDate,
    categoryId,
    subCategoryId,
    zoneCode,
    regionCode,
    districtCode,
    issueTypeId,
    assignedTo,
    statusId,
    divisionId,
    zoneLabel,
    regionLabel,
    districtLabel,
    issueTypeLabel,
    divisionLabel,
    categoryLabel,
    subCategoryLabel,
    statusLabel,
    requestedBy,
    lastModifiedStatusFromDate,
    lastModifiedStatusToDate,
    signal,
}: SearchTicketsForExportParams & { reportCode: string; format: 'PDF' | 'EXCEL' }) {
    const params = new URLSearchParams();
    params.append('reportCode', reportCode);
    params.append('format', format);
    if (dateParam) params.append('dateParam', dateParam);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (categoryId) params.append('category', categoryId);
    if (subCategoryId) params.append('subCategory', subCategoryId);
    if (zoneCode) params.append('zoneCode', zoneCode);
    if (regionCode) params.append('regionCode', regionCode);
    if (districtCode) params.append('districtCode', districtCode);
    if (issueTypeId) params.append('issueTypeId', issueTypeId);
    if (divisionId) params.append('divisionId', divisionId);
    if (zoneLabel) params.append('zoneLabel', zoneLabel);
    if (regionLabel) params.append('regionLabel', regionLabel);
    if (districtLabel) params.append('districtLabel', districtLabel);
    if (issueTypeLabel) params.append('issueTypeLabel', issueTypeLabel);
    if (divisionLabel) params.append('divisionLabel', divisionLabel);
    if (categoryLabel) params.append('categoryLabel', categoryLabel);
    if (subCategoryLabel) params.append('subCategoryLabel', subCategoryLabel);
    if (statusLabel) params.append('statusLabel', statusLabel);
    if (assignedTo) params.append('assignedTo', assignedTo);
    if (statusId) params.append('status', statusId);
    if (requestedBy) params.append('requestedBy', requestedBy);
    if (lastModifiedStatusFromDate) params.append('lastModifiedStatusFromDate', lastModifiedStatusFromDate);
    if (lastModifiedStatusToDate) params.append('lastModifiedStatusToDate', lastModifiedStatusToDate);
    return axios.get(`${BASE_URL}/tickets/search/export/download?${params.toString()}`, signal ? { signal } : undefined);
}



export interface ReportDownloadsParams {
    page?: number;
    size?: number;
}

export function getReportDownloads(params: ReportDownloadsParams = {}) {
    const searchParams = new URLSearchParams();
    if (typeof params.page === 'number') searchParams.append('page', String(params.page));
    if (typeof params.size === 'number') searchParams.append('size', String(params.size));
    const query = searchParams.toString();
    return axios.get(`${BASE_URL}/reports/downloads${query ? `?${query}` : ''}`);
}

export function getReportDownloadUrl(downloadPath: string) {
    if (!downloadPath) return '';
    if (/^https?:\/\//i.test(downloadPath)) return downloadPath;
    return `${BASE_URL}${downloadPath}`;
}

interface SearchTicketsForExportParams {
    fromDate?: string;
    dateParam?: string;
    toDate?: string;
    categoryId?: string;
    subCategoryId?: string;
    zoneCode?: string;
    regionCode?: string;
    districtCode?: string;
    issueTypeId?: string;
    assignedTo?: string;
    statusId?: string;
    divisionId?: string;
    zoneLabel?: string;
    regionLabel?: string;
    districtLabel?: string;
    issueTypeLabel?: string;
    divisionLabel?: string;
    categoryLabel?: string;
    subCategoryLabel?: string;
    statusLabel?: string;
    requestedBy?: string;
    lastModifiedStatusFromDate?: string;
    lastModifiedStatusToDate?: string;
    signal?: AbortSignal;
}

export function searchTicketsForExport({
    fromDate,
    dateParam,
    toDate,
    categoryId,
    subCategoryId,
    zoneCode,
    regionCode,
    districtCode,
    issueTypeId,
    assignedTo,
    statusId,
    divisionId,
    zoneLabel,
    regionLabel,
    districtLabel,
    issueTypeLabel,
    divisionLabel,
    categoryLabel,
    subCategoryLabel,
    statusLabel,
    requestedBy,
    lastModifiedStatusFromDate,
    lastModifiedStatusToDate,
    signal,
}: SearchTicketsForExportParams) {
    const params = new URLSearchParams();
    if (dateParam) params.append('dateParam', dateParam);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (categoryId) params.append('category', categoryId);
    if (subCategoryId) params.append('subCategory', subCategoryId);
    if (zoneCode) params.append('zoneCode', zoneCode);
    if (regionCode) params.append('regionCode', regionCode);
    if (districtCode) params.append('districtCode', districtCode);
    if (issueTypeId) params.append('issueTypeId', issueTypeId);
    if (divisionId) params.append('divisionId', divisionId);
    if (zoneLabel) params.append('zoneLabel', zoneLabel);
    if (regionLabel) params.append('regionLabel', regionLabel);
    if (districtLabel) params.append('districtLabel', districtLabel);
    if (issueTypeLabel) params.append('issueTypeLabel', issueTypeLabel);
    if (divisionLabel) params.append('divisionLabel', divisionLabel);
    if (categoryLabel) params.append('categoryLabel', categoryLabel);
    if (subCategoryLabel) params.append('subCategoryLabel', subCategoryLabel);
    if (statusLabel) params.append('statusLabel', statusLabel);
    if (assignedTo) params.append('assignedTo', assignedTo);
    if (statusId) params.append('status', statusId);
    if (requestedBy) params.append('requestedBy', requestedBy);
    if (lastModifiedStatusFromDate) params.append('lastModifiedStatusFromDate', lastModifiedStatusFromDate);
    if (lastModifiedStatusToDate) params.append('lastModifiedStatusToDate', lastModifiedStatusToDate);
    if (divisionId) params.append('divisionId', divisionId);
    return axios.get(`${BASE_URL}/tickets/search/export?${params.toString()}`, signal ? { signal } : undefined);
}
