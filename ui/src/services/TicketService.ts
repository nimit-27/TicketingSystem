import axios from "axios";
import { BASE_URL } from "./api";

export function searchTickets(payload: string) {
    return axios.post(`${BASE_URL}/tickets`, payload);
}

export function addTicket(payload: string) {
    return axios.post(`${BASE_URL}/tickets/add`, payload);
}

export function getTickets(page: number = 0, size: number = 5) {
    return axios.get(`${BASE_URL}/tickets?page=${page}&size=${size}`);
}

export function getTicket(id: string) {
    return axios.get(`${BASE_URL}/tickets/${id}`);
}

export function updateTicket(id: string, payload: any) {
    return axios.put(`${BASE_URL}/tickets/${id}`, payload);
}

export function linkTicketToMaster(id: string, masterId: string) {
    return axios.put(`${BASE_URL}/tickets/${id}/link/${masterId}`);
}

export function addComment(id: string, comment: string) {
    return axios.post(`${BASE_URL}/tickets/${id}/comments`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    });
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