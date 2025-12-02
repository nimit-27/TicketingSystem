import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import Title from "../components/Title";
import FileUpload from "../components/UI/FileUpload";
import GenericTable from "../components/UI/GenericTable";
import { useApi } from "../hooks/useApi";
import { getRoleSummaries } from "../services/RoleService";
import { getHelpdeskUsers } from "../services/UserService";
import { listManagedFiles, uploadManagedFile, getManagedFileContentUrl } from "../services/FileManagementService";
import { FileDocument } from "../types/fileManagement";
import { getDropdownOptions } from "../utils/Utils";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import { useTranslation } from "react-i18next";

const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const FileManagementSystem: React.FC = () => {
    const { t } = useTranslation();
    const [section, setSection] = useState("documentation");
    const [description, setDescription] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const { data: storedFiles = [], apiHandler: listFilesHandler } = useApi<FileDocument[]>();
    const { data: rolesData = [], apiHandler: loadRoles } = useApi<any>();
    const { data: helpdeskUsers = [], apiHandler: loadHelpdeskUsers } = useApi<any>();
    const { apiHandler: uploadHandler, pending: uploading } = useApi<FileDocument>();

    useEffect(() => {
        void listFilesHandler(() => listManagedFiles());
        void loadRoles(() => getRoleSummaries());
        void loadHelpdeskUsers(() => getHelpdeskUsers());
    }, []);

    const roleOptions = useMemo(() => getDropdownOptions(rolesData, "role", "roleId"), [rolesData]);
    const userOptions = useMemo(() => getDropdownOptions(helpdeskUsers, "name", "userId"), [helpdeskUsers]);

    const handleUpload = async () => {
        if (!files.length) {
            return;
        }
        const payload = {
            section,
            description,
            roles: selectedRoles,
            userIds: selectedUsers,
        };
        await uploadHandler(() => uploadManagedFile(files[0], payload));
        setFiles([]);
        setDescription("");
        await listFilesHandler(() => listManagedFiles());
    };

    const columns = [
        {
            title: t("File Name"),
            dataIndex: "fileName",
            key: "fileName",
            render: (_: string, record: FileDocument) => (
                <a href={getManagedFileContentUrl(record.id)} target="_blank" rel="noreferrer">
                    {record.fileName}
                </a>
            ),
        },
        {
            title: t("Section"),
            dataIndex: "section",
            key: "section",
            render: (value: string) => value || t("General"),
        },
        {
            title: t("Uploaded By"),
            dataIndex: "uploadedByName",
            key: "uploadedByName",
            render: (_: string, record: FileDocument) => record.uploadedByName || record.uploadedBy || t("Unknown"),
        },
        {
            title: t("Uploaded On"),
            dataIndex: "uploadedOn",
            key: "uploadedOn",
            render: (value: string | undefined) => (value ? new Date(value).toLocaleString() : "--"),
        },
        {
            title: t("Roles"),
            dataIndex: "roles",
            key: "roles",
            render: (value: string[]) => value?.length ? value.join(", ") : t("All Roles"),
        },
        {
            title: t("Users"),
            dataIndex: "userIds",
            key: "userIds",
            render: (value: string[]) => value?.length ? value.join(", ") : t("All Helpdesk Users"),
        },
        {
            title: t("Size"),
            dataIndex: "fileSize",
            key: "fileSize",
            render: (value: number) => formatBytes(value || 0),
        },
    ];

    return (
        <Box>
            <Title textKey="File Management" />
            <Typography variant="body1" mb={2}>{t("Manage documentation and technical files with role aware access controls.")}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                        <TextField
                            label={t("Section")}
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label={t("Description")}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                        />
                        <GenericDropdown
                            multiple
                            label="Roles"
                            value={selectedRoles as any}
                            onChange={(e) => setSelectedRoles((e.target.value as string[]))}
                            options={roleOptions}
                            fullWidth
                        />
                        <GenericDropdown
                            multiple
                            label="Users"
                            value={selectedUsers as any}
                            onChange={(e) => setSelectedUsers((e.target.value as string[]))}
                            options={userOptions}
                            fullWidth
                        />
                        <FileUpload maxSizeMB={20} onFilesChange={(f) => setFiles(f)} attachments={files} />
                        <Stack direction="row" spacing={1}>
                            <Button variant="contained" onClick={handleUpload} disabled={uploading}>
                                {t("Upload")}
                            </Button>
                            {files.length > 0 && (
                                <Chip label={files[0].name} onDelete={() => setFiles([])} color="secondary" />
                            )}
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                    <GenericTable
                        rowKey={(row: any) => row.id}
                        columns={columns as any}
                        dataSource={storedFiles}
                        pagination={false}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default FileManagementSystem;
