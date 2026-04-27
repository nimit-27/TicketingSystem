import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import GenericTable from "../components/UI/GenericTable";
import Title from "../components/Title";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import { useApi } from "../hooks/useApi";
import { getChangeRequests, getCrStatusMasterList } from "../services/TicketCrService";
import { getHelpdeskUsers } from "../services/UserService";
import { getDropdownOptions } from "../utils/Utils";

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

const ChangeRequests: React.FC = () => {
    const { t } = useTranslation();
    const { data: changeRequests = [], pending: loading, apiHandler: loadChangeRequests } = useApi<ChangeRequestRow[]>();
    const { data: crStatusList = [], apiHandler: loadCrStatusList } = useApi<any[]>();
    const { data: helpdeskUsers = [], apiHandler: loadHelpdeskUsers } = useApi<any[]>();

    const [searchText, setSearchText] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState("All");
    const [selectedCrStatus, setSelectedCrStatus] = useState("All");
    const [sortBy, setSortBy] = useState<"createdOn" | "modifiedOn">("createdOn");

    useEffect(() => {
        void loadChangeRequests(() => getChangeRequests());
        void loadCrStatusList(() => getCrStatusMasterList());
        void loadHelpdeskUsers(() => getHelpdeskUsers());
    }, [loadChangeRequests, loadCrStatusList, loadHelpdeskUsers]);

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
    ], [t]);

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
        </div>
    );
};

export default ChangeRequests;
