import apiClient from "./apiClient";
import { BASE_URL } from "./api";
import { HelpdeskUser, RequesterUser } from "../types/users";
import { PaginatedResponse } from "../types/pagination";

export interface CreateUserPayload {
    username: string;
    name: string;
    emailId: string;
    mobileNo: string;
    office: string;
    roleIds: string[];
    levelIds: string[];
    stakeholderIds: string[];
}

export function getUserDetails(payload: string) {
    return apiClient.get(`${BASE_URL}/users/${payload}`);
}

export function getAllUsers() {
    return apiClient.get(`${BASE_URL}/users`);
}

export function getHelpdeskUsers() {
    return apiClient.get<HelpdeskUser[]>(`${BASE_URL}/users/helpdesk`);
}

export function searchHelpdeskUsers(query: string, roleId?: string, stakeholderId?: string, page: number = 0, size: number = 10) {
    return apiClient.get<PaginatedResponse<HelpdeskUser>>(`${BASE_URL}/users/helpdesk/search`, {
        params: { query, roleId, stakeholderId, page, size },
    });
}

export function getHelpdeskUserDetails(userId: string) {
    return apiClient.get<HelpdeskUser>(`${BASE_URL}/users/helpdesk/${userId}`);
}

export function getRequesterUsers() {
    return apiClient.get<RequesterUser[]>(`${BASE_URL}/users/requesters`);
}

export function searchRequesterUsers(
    query: string,
    roleId?: string,
    stakeholderId?: string,
    officeCode?: string,
    officeType?: string,
    zoneCode?: string,
    regionCode?: string,
    districtCode: string = '',
    page: number = 0,
    size: number = 10,
) {
    return apiClient.get<PaginatedResponse<RequesterUser>>(`${BASE_URL}/users/requesters/search`, {
        params: { query, roleId, stakeholderId, officeCode, officeType, zoneCode, regionCode, districtCode, page, size },
    });
}

export function getRequesterUserDetails(userId: string) {
    return apiClient.get<RequesterUser>(`${BASE_URL}/users/requesters/${userId}`);
}

export function getRequesterOfficeTypes() {
    return apiClient.get<string[]>(`${BASE_URL}/users/requesters/office-types`);
}

export function appointRequesterAsRno(userId: string) {
    return apiClient.post(`${BASE_URL}/users/requesters/${userId}/appoint-rno`);
}

export function getUsersByRoles(roleIds: string[]) {
    return apiClient.post(`${BASE_URL}/users/by-roles`, roleIds);
}

export function addUser(user: any) {
    return apiClient.post(`${BASE_URL}/users`, user);
}

export function createUser(user: CreateUserPayload) {
    return apiClient.post(`${BASE_URL}/users/admin`, user);
}

export function checkUsernameAvailability(username: string) {
    return apiClient.get(`${BASE_URL}/users/check-username`, { params: { username } });
}

export function deleteUser(id: string) {
    return apiClient.delete(`${BASE_URL}/users/${id}`);
}

export function updateUser(userId: string, payload: Partial<HelpdeskUser>) {
    return apiClient.put(`${BASE_URL}/users/${userId}`, payload);
}
