import apiClient from "./apiClient";
import { BASE_URL } from "./api";
import { FileDocument, FileUploadPayload } from "../types/fileManagement";

export function listManagedFiles(section?: string) {
    return apiClient.get<FileDocument[]>(`${BASE_URL}/file-management/files`, { params: { section } });
}

export function uploadManagedFile(file: File, payload: FileUploadPayload) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    return apiClient.post<FileDocument>(`${BASE_URL}/file-management/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export function getManagedFileMetadata(id: string) {
    return apiClient.get<FileDocument>(`${BASE_URL}/file-management/files/${id}`);
}

export function getManagedFileContentUrl(id: string) {
    return `${BASE_URL}/file-management/files/${id}/content`;
}
