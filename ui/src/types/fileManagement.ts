export interface FileDocument {
    id: string;
    fileName: string;
    section?: string;
    description?: string;
    uploadedBy?: string;
    uploadedByName?: string;
    uploadedOn?: string;
    fileSize: number;
    contentType?: string;
    roles: string[];
    userIds: string[];
    storagePath: string;
}

export interface FileUploadPayload {
    section?: string;
    description?: string;
    roles?: string[];
    userIds?: string[];
}
