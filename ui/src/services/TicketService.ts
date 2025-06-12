import axios from "axios";

let baseURL = "http://localhost:8081";

export function searchTickets(payload: string) {
    console.log("searchTickets called with payload:", payload);
    return axios.post(`${baseURL}/tickets`, payload)
}

export function addTicket(payload: string) {
    console.log("addTicket called with payload:", payload);
    return axios.post(`${baseURL}/tickets/add`, payload)
}

export function getTickets(page: number = 0, size: number = 5) {
    console.log("getTickets called");
    return axios.get(`${baseURL}/tickets?page=${page}&size=${size}`);
}

export function getTicket(id: number) {
    return axios.get(`${baseURL}/tickets/${id}`);
}

export function updateTicket(id: number, payload: any) {
    return axios.put(`${baseURL}/tickets/${id}`, payload);
}

export function linkTicketToMaster(id: number, masterId: number) {
    return axios.put(`${baseURL}/tickets/${id}/link/${masterId}`);
}

export function addComment(id: number, comment: string) {
    return axios.post(`${baseURL}/tickets/${id}/comments`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export function getComments(id: number, count?: number) {
    const url = count ? `${baseURL}/tickets/${id}/comments?count=${count}` : `${baseURL}/tickets/${id}/comments`;
    return axios.get(url);
}

export function updateComment(commentId: number, comment: string) {
    return axios.put(`${baseURL}/tickets/comments/${commentId}`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    });
}

export function deleteComment(commentId: number) {
    return axios.delete(`${baseURL}/tickets/comments/${commentId}`);
}