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

export function getTicket(id: number) {
    return axios.get(`${BASE_URL}/tickets/${id}`);
}

export function updateTicket(id: number, payload: any) {
    return axios.put(`${BASE_URL}/tickets/${id}`, payload);
}

export function linkTicketToMaster(id: number, masterId: number) {
    return axios.put(`${BASE_URL}/tickets/${id}/link/${masterId}`);
}

export function addComment(id: number, comment: string) {
    return axios.post(`${BASE_URL}/tickets/${id}/comments`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export function getComments(id: number, count?: number) {
    const url = count ? `${BASE_URL}/tickets/${id}/comments?count=${count}` : `${BASE_URL}/tickets/${id}/comments`;
    return axios.get(url);
}

export function updateComment(commentId: number, comment: string) {
    return axios.put(`${BASE_URL}/tickets/comments/${commentId}`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export function deleteComment(commentId: number) {
    return axios.delete(`${BASE_URL}/tickets/comments/${commentId}`);
}