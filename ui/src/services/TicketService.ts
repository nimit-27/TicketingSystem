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
    fromDate?: string,
    toDate?: string,
    categoryId?: string,
    subCategoryId?: string,
    zoneCode?: string,
    regionCode?: string,
    districtCode?: string,
    issueTypeId?: string,
) {
    const params = new URLSearchParams({ query, page: String(page), size: String(size) });
    if (statusName) params.append('status', statusName);
    if (master !== undefined) params.append('master', String(master));
    if (assignedTo) params.append('assignedTo', assignedTo);
    if (levelId) params.append('levelId', levelId);
    if (assignedBy) params.append('assignedBy', assignedBy);
    if (requestorId) params.append('requestorId', requestorId);
    if (sortBy) params.append('sortBy', sortBy);
    if (direction) params.append('direction', direction);
    if (severity) params.append('severity', severity);
    if (createdBy) params.append('createdBy', createdBy);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (categoryId) params.append('category', categoryId);
    if (subCategoryId) params.append('subCategory', subCategoryId);
    if (zoneCode) params.append('zoneCode', zoneCode);
    if (regionCode) params.append('regionCode', regionCode);
    if (districtCode) params.append('districtCode', districtCode);
    if (issueTypeId) params.append('issueTypeId', issueTypeId);
    return axios.get(`${BASE_URL}/tickets/search?${params.toString()}`);
}

interface SearchTicketsForExportParams {
    fromDate?: string;
    toDate?: string;
    zoneCode?: string;
    regionCode?: string;
    districtCode?: string;
    issueTypeId?: string;
}

export function searchTicketsForExport({
    fromDate,
    toDate,
    zoneCode,
    regionCode,
    districtCode,
    issueTypeId,
}: SearchTicketsForExportParams) {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (zoneCode) params.append('zoneCode', zoneCode);
    if (regionCode) params.append('regionCode', regionCode);
    if (districtCode) params.append('districtCode', districtCode);
    if (issueTypeId) params.append('issueTypeId', issueTypeId);
    return axios.get(`${BASE_URL}/tickets/search/export?${params.toString()}`);
}
