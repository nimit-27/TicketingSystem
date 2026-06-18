import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import GenericTable from "../components/UI/GenericTable";
import Title from "../components/Title";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import GenericButton from "../components/UI/Button";
import { useApi } from "../hooks/useApi";
import {
    createAllMissingChangeRequests,
    createMissingChangeRequest,
    getChangeRequests,
    getCrStatusMasterList,
    getTicketsMissingChangeRequest,
} from "../services/TicketCrService";
import { getHelpdeskUsers } from "../services/UserService";
import { getDropdownOptions } from "../utils/Utils";
import { getCurrentUserDetails } from "../config/config";
import { useSnackbar } from "../context/SnackbarContext";

interface ChangeRequestRow {
    ticketCrId: string;
    ticketId: string;
    subject: string;
    description: string;
    assignedTo: string;
    crStatusId: string;
    crStatusName: string;
    createdDate?: string;
    updatedOn?: string;
}

interface MissingChangeRequestRow {
    ticketId: string;
    subject: string;
    description: string;
    requestedBy: string;
    assignedTo: string;
    reportedDate?: string;
}

const ChangeRequests: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showMessage } = useSnackbar();
    const { data: changeRequestData, pending: loading, apiHandler: loadChangeRequests } = useApi<ChangeRequestRow[]>();
    const {
        data: missingChangeRequestData,
        pending: missingLoading,
        apiHandler: loadMissingChangeRequests,
    } = useApi<MissingChangeRequestRow[]>();
    const { data: crStatusData, apiHandler: loadCrStatusList } = useApi<any[]>();
    const { data: helpdeskUserData, apiHandler: loadHelpdeskUsers } = useApi<any[]>();
    const changeRequests = changeRequestData || [];
    const missingChangeRequests = missingChangeRequestData || [];
    const crStatusList = crStatusData || [];
    const helpdeskUsers = helpdeskUserData || [];
    const [submittingTicketId, setSubmittingTicketId] = useState<string | null>(null);
    const [submittingAll, setSubmittingAll] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState("All");
    const [selectedCrStatus, setSelectedCrStatus] = useState("All");
    const [sortBy, setSortBy] = useState<"createdOn" | "modifiedOn">("createdOn");

    useEffect(() => {
        void loadChangeRequests(() => getChangeRequests());
        void loadMissingChangeRequests(() => getTicketsMissingChangeRequest());
        void loadCrStatusList(() => getCrStatusMasterList());
        void loadHelpdeskUsers(() => getHelpdeskUsers());
    }, [loadChangeRequests, loadMissingChangeRequests, loadCrStatusList, loadHelpdeskUsers]);

    const refreshChangeRequestLists = async () => {
        await Promise.all([
            loadChangeRequests(() => getChangeRequests()),
            loadMissingChangeRequests(() => getTicketsMissingChangeRequest()),
        ]);
    };

    const currentUsername = getCurrentUserDetails()?.username;

    const handleSendForCrApproval = async (ticketId: string) => {
        setSubmittingTicketId(ticketId);
        try {
            await createMissingChangeRequest(ticketId, currentUsername);
            showMessage(t("Change request created successfully"), "success");
            await refreshChangeRequestLists();
        } catch {
            showMessage(t("Unable to create change request"), "error");
        } finally {
            setSubmittingTicketId(null);
        }
    };

    const handleSendAllForCrApproval = async () => {
        setSubmittingAll(true);
        try {
            const response = await createAllMissingChangeRequests(currentUsername);
            const failedCount = response.data?.failedTicketIds?.length || 0;
            if (failedCount > 0) {
                showMessage(
                    t("Created {{createdCount}} change requests; {{failedCount}} failed", {
                        createdCount: response.data?.createdCount || 0,
                        failedCount,
                    }),
                    "warning",
                );
            } else {
                showMessage(t("All change requests created successfully"), "success");
            }
            await refreshChangeRequestLists();
        } catch {
            showMessage(t("Unable to create change requests"), "error");
        } finally {
            setSubmittingAll(false);
        }
    };

    const assigneeOptions = useMemo(
        () => [{ label: "All", value: "All" }, ...getDropdownOptions(helpdeskUsers, "name", "username")],
        [helpdeskUsers],
    );

    const crStatusOptions = useMemo(
        () => [{ label: "All", value: "All" }, ...getDropdownOptions(crStatusList, "crStatusName", "crStatusId")],
        [crStatusList],
    );

    const sortOptions = useMemo(
        () => getDropdownOptions([
            { label: "CR Created On", value: "createdOn" },
            { label: "CR Modified On", value: "modifiedOn" },
        ], "label", "value"),
        [],
    );

    const filteredRows = useMemo(() => {
        const q = searchText.trim().toLowerCase();

        const filtered = changeRequests?.filter((row) => {
            const matchesSearch = !q || [row.ticketCrId, row.ticketId, row.subject, row.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));

            const matchesAssignee = selectedAssignee === "All" || row.assignedTo === selectedAssignee;
            const matchesCrStatus = selectedCrStatus === "All" || row.crStatusId === selectedCrStatus;

            return matchesSearch && matchesAssignee && matchesCrStatus;
        });

        return filtered?.sort((a, b) => {
            const first = sortBy === "createdOn" ? a.createdDate : a.updatedOn;
            const second = sortBy === "createdOn" ? b.createdDate : b.updatedOn;
            return new Date(second || 0).getTime() - new Date(first || 0).getTime();
        });
    }, [changeRequests, searchText, selectedAssignee, selectedCrStatus, sortBy]);

    const columns: ColumnsType<ChangeRequestRow> = useMemo(() => [
        {
            title: t("CR Id"),
            dataIndex: "ticketCrId",
            key: "ticketCrId",
            render: (value: string) => (<a onClick={() => navigate(`/change-requests/${value}`)}>{value}</a>),
        },
        {
            title: t("Ticket Id"),
            dataIndex: "ticketId",
            key: "ticketId",
        },
        {
            title: t("Subject"),
            dataIndex: "subject",
            key: "subject",
        },
        {
            title: t("Description"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: t("Assigned To"),
            dataIndex: "assignedTo",
            key: "assignedTo",
            render: (value: string) => value || "-",
        },
        {
            title: t("CR Status"),
            dataIndex: "crStatusName",
            key: "crStatusName",
        },
        {
            title: t("CR Created On"),
            dataIndex: "createdDate",
            key: "createdDate",
            render: (value?: string) => (value ? new Date(value).toLocaleString() : "-"),
        },
        {
            title: t("CR Modified On"),
            dataIndex: "updatedOn",
            key: "updatedOn",
            render: (value?: string) => (value ? new Date(value).toLocaleString() : "-"),
        },
    ], [t, navigate]);

    const missingColumns: ColumnsType<MissingChangeRequestRow> = useMemo(() => [
        {
            title: t("Ticket Id"),
            dataIndex: "ticketId",
            key: "ticketId",
            render: (value: string) => (<a onClick={() => navigate(`/tickets/${value}`)}>{value}</a>),
        },
        {
            title: t("Subject"),
            dataIndex: "subject",
            key: "subject",
        },
        {
            title: t("Description"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: t("Requested By"),
            dataIndex: "requestedBy",
            key: "requestedBy",
            render: (value: string) => value || "-",
        },
        {
            title: t("Assigned To"),
            dataIndex: "assignedTo",
            key: "assignedTo",
            render: (value: string) => value || "-",
        },
        {
            title: t("Reported On"),
            dataIndex: "reportedDate",
            key: "reportedDate",
            render: (value?: string) => (value ? new Date(value).toLocaleString() : "-"),
        },
        {
            title: t("Action"),
            key: "action",
            render: (_, row) => (
                <GenericButton
                    variant="contained"
                    size="small"
                    disabled={submittingAll || submittingTicketId !== null}
                    onClick={() => void handleSendForCrApproval(row.ticketId)}
                >
                    {submittingTicketId === row.ticketId ? t("Sending...") : t("Send for CR Approval")}
                </GenericButton>
            ),
        },
    ], [t, navigate, submittingAll, submittingTicketId]);

    return (
        <div>
            <Title textKey="Change Requests" />

            <div className="row g-2 mb-3">
                <div className="col-3">
                    <GenericInput
                        className="w-100"
                        label="Search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by CR Id, Ticket Id, Subject, Description"
                    />
                </div>

                <div className="col-3">
                    <DropdownController
                        className="w-100"
                        label="Assigned To"
                        value={selectedAssignee}
                        onChange={setSelectedAssignee}
                        options={assigneeOptions}
                    />
                </div>

                <div className="col-3">
                    <DropdownController
                        className="w-100"
                        label="CR Status"
                        value={selectedCrStatus}
                        onChange={setSelectedCrStatus}
                        options={crStatusOptions}
                    />
                </div>

                <div className="col-3">
                    <DropdownController
                        className="w-100"
                        label="Sort By"
                        value={sortBy}
                        onChange={(value) => setSortBy(value as "createdOn" | "modifiedOn")}
                        options={sortOptions}
                    />
                </div>
            </div>

            <GenericTable
                rowKey="ticketCrId"
                columns={columns}
                dataSource={filteredRows}
                loading={loading}
                pagination={{ pageSize: 20 }}
            />

            {missingChangeRequests?.length
                ? <>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h5 className="mb-0">{t("Change Requested Tickets Pending CR Creation")}</h5>
                        <GenericButton
                            variant="contained"
                            disabled={submittingAll || submittingTicketId !== null || missingChangeRequests.length === 0}
                            onClick={() => void handleSendAllForCrApproval()}
                        >
                            {submittingAll ? t("Sending...") : t("Send All for CR Approval")}
                        </GenericButton>
                    </div>

                    <GenericTable
                        rowKey="ticketId"
                        columns={missingColumns}
                        dataSource={missingChangeRequests}
                        loading={missingLoading}
                        pagination={{ pageSize: 10 }}
                    />
                </>
                : null}
        </div>
    );
};

export default ChangeRequests;
