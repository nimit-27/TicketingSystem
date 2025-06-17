import React, { useEffect, useMemo, useState } from "react";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { getTickets } from "../services/TicketService";
import { getStatuses } from "../services/StatusService";
import PaginationControls from "../components/PaginationControls";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import MasterIcon from "../components/UI/Icons/MasterIcon";
import TicketsTable from "../components/AllTickets/TicketsTable";
import TicketCard from "../components/AllTickets/TicketCard";
import ViewToggle from "../components/UI/ViewToggle";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { Ticket } from "../types";
import { FciTheme } from "../config/config";

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
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [statusOptions, setStatusOptions] = useState<string[]>([]);

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
        apiHandler(() => getTickets(page - 1, 5));
    }, [page]);

    useEffect(() => {
        if (data) {
            const resp = data;
            setTotalPages(resp.totalPages || 1);
            setFiltered(resp.items || resp);
        }
    }, [data]);

    useEffect(() => {
        if (!data) return;
        const resp = data;
        let list: Ticket[] = resp.items || resp;
        if (statusFilter !== 'ALL') {
            list = list.filter(t => t.status === statusFilter);
        }
        const query = debouncedSearch.toLowerCase();
        const f = list.filter((t: any) =>
            t.subject.toLowerCase().includes(query) || String(t.id).includes(query)
        );
        setFiltered(f);
    }, [debouncedSearch, data, statusFilter]);

    const columns = useMemo(
        () => [
            {
                title: "Ticket Id",
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
                title: "Requestor Name",
                key: "name",
                render: (_: any, record: Ticket) => record.requestorName || "-",
            },
            {
                title: "Email",
                key: "email",
                render: (_: any, record: Ticket) => record.requestorEmailId || "-",
            },
            {
                title: "Mobile",
                key: "mobile",
                render: (_: any, record: Ticket) => record.requestorMobileNo || "-",
            },
            {
                title: "Category",
                dataIndex: "category",
                key: "category",
            },
            {
                title: "Sub-Category",
                dataIndex: "subCategory",
                key: "subCategory",
            },
            {
                title: "Priority",
                dataIndex: "priority",
                key: "priority",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value: any) => value || "-",
            },
            {
                title: "Action",
                key: "action",
                render: () => <VisibilityIcon fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />,
            },
        ],
        []
    );

    return (
        <div className="container">
            <Title text="My Tickets" />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <GenericInput
                    label="Search by Id or Subject"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mr: 2 }}
                />
                <DropdownController
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions.map(s => ({ label: s, value: s }))}
                    style={{ width: 150, marginRight: 8 }}
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
            {pending && <p>Loading...</p>}
            {error && <p className="text-danger">Error loading tickets</p>}
            {!pending && viewMode === 'table' && (
                <div>
                    <TicketsTable tickets={filtered} onRowClick={(id: any) => navigate(`/tickets/${id}`)} />
                    <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} className="mt-3" />
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
