import React, { useEffect, useMemo, useState } from "react";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { getTickets, searchTicketsPaginated } from "../services/TicketService";
import { getStatuses } from "../services/StatusService";
import PaginationControls from "../components/PaginationControls";
import { IconButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { useTranslation } from "react-i18next";
import MasterIcon from "../components/UI/Icons/MasterIcon";
import TicketsTable from "../components/AllTickets/TicketsTable";
import TicketCard from "../components/AllTickets/TicketCard";
import AssigneeDropdown from "../components/AllTickets/AssigneeDropdown";
import ViewToggle from "../components/UI/ViewToggle";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { Ticket } from "../types";

const statusOptions = [
    { name: "All", id: "ALL" },
    { name: "Pending", id: "PENDING" },
    { name: "On Hold", id: "ON_HOLD" },
    { name: "Closed", id: "CLOSED" },
    { name: "Reopened", id: "REOPENED" },
    { name: "Resolved", id: "RESOLVED" },
    { name: "Assign Further", id: "ASSIGN_FURTHER" }
];


const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const AllTickets: React.FC = () => {
    const { data, pending, error, apiHandler } = useApi<any>();
    const { data: statusList, apiHandler: statusApiHandler } = useApi();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("table");
    const [filtered, setFiltered] = useState<Ticket[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [masterOnly, setMasterOnly] = useState(false);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const { t } = useTranslation();

    const priorityConfig: Record<string, { color: string; count: number }> = {
        Low: { color: 'success.light', count: 1 },
        Medium: { color: 'warning.light', count: 2 },
        High: { color: 'error.main', count: 3 },
        Critical: { color: 'error.dark', count: 4 }
    };

    const statusFilterOptions: DropdownOption[] = getDropdownOptions(statusOptions, "name", "id")

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        statusApiHandler(() => getStatuses());
    }, []);

    useEffect(() => {
        if (Array.isArray(statusList)) {
            setStatusOptions(['ALL', ...statusList]);
        }
    }, [statusList]);

    useEffect(() => {
        apiHandler(() =>
            searchTicketsPaginated(
                debouncedSearch,
                statusFilter === 'ALL' ? undefined : statusFilter,
                masterOnly ? true : undefined,
                page - 1,
                pageSize
            )
        );
    }, [debouncedSearch, statusFilter, masterOnly, page, pageSize]);

    useEffect(() => {
        if (data) {
            const resp = data;
            setTotalPages(resp.totalPages || 1);
            setFiltered(resp.items || resp);
        }
    }, [data]);

    const columns = useMemo(
        () => [
            {
                title: t('Ticket Id'),
                dataIndex: "id",
                key: "id",
                render: (_: any, record: Ticket) => (
                    <div className="d-flex align-items-center">
                        {record.id}
                        {record.isMaster && <MasterIcon />}
                    </div>
                ),
            },
            {
                title: t('Requestor Name'),
                key: "name",
                render: (_: any, record: Ticket) => record.requestorName || "-",
            },
            {
                title: t('Email'),
                key: "email",
                render: (_: any, record: Ticket) => record.requestorEmailId || "-",
            },
            {
                title: t('Mobile'),
                key: "mobile",
                render: (_: any, record: Ticket) => record.requestorMobileNo || "-",
            },
            {
                title: t('Category'),
                dataIndex: "category",
                key: "category",
            },
            {
                title: t('Sub-Category'),
                dataIndex: "subCategory",
                key: "subCategory",
            },
            {
                title: t('Priority'),
                dataIndex: "priority",
                key: "priority",
            },
            {
                title: t('Assignee'),
                key: 'assignee',
                render: (_: any, record: Ticket) => (
                    <AssigneeDropdown ticketId={record.id} assigneeName={record.assignedTo} />
                )
            },
            {
                title: t('Status'),
                dataIndex: "status",
                key: "status",
                render: (value: any) => value || "-",
            },
            {
                title: t('Action'),
                key: "action",
                render: () => <VisibilityIcon fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />,
            },
        ],
        []
    );

    return (
        <div className="container">
            <Title textKey="My Tickets" />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <GenericInput
                    label="Search"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mr: 2, width: 250 }}
                />
                <DropdownController
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions.map(s => ({ label: s, value: s }))}
                    style={{ width: 180, marginRight: 8 }}
                />
                <ViewToggle
                    value={masterOnly ? 'master' : 'all'}
                    onChange={(val: string) => setMasterOnly(val === 'master')}
                    options={[
                        { label: t('All'), value: 'all' },
                        { label: t('Master'), value: 'master' }
                    ]}
                    radio
                />
                <ViewToggle
                    value={viewMode}
                    onChange={setViewMode}
                    options={[
                        { icon: 'grid', value: 'grid' },
                        { icon: 'table', value: 'table' }
                    ]}
                />
            </div>
            {pending && <p>{t('Loading...')}</p>}
            {error && <p className="text-danger">{t('Error loading tickets')}</p>}
            {!pending && viewMode === 'table' && (
                <div>
                    <TicketsTable tickets={filtered} onRowClick={(id: any) => navigate(`/tickets/${id}`)} />
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} />
                        <div className="d-flex align-items-center">
                            <IconButton size="small" onClick={() => setPageSize(ps => ps > 1 ? ps - 1 : 1)}>
                                <ArrowDropDownIcon />
                            </IconButton>
                            <GenericInput
                                type="number"
                                value={pageSize}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (!isNaN(v) && v > 0) setPageSize(v);
                                }}
                                size="small"
                                sx={{ width: 60, mx: 1 }}
                            />
                            <span>/ page</span>
                            <IconButton size="small" onClick={() => setPageSize(ps => ps + 1)}>
                                <ArrowDropUpIcon />
                            </IconButton>
                        </div>
                    </div>
                </div>
            )}
            {!pending && viewMode === 'grid' && (
                <div className="row">
                    {filtered.map((t) => (
                        <div className="col-md-4 mb-3" key={t.id}>
                            <TicketCard ticket={t} priorityConfig={priorityConfig} onClick={() => navigate(`/tickets/${t.id}`)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllTickets;
