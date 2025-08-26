import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { searchTicketsPaginated } from "../services/TicketService";
import { getStatuses } from "../utils/Utils";
import PaginationControls from "../components/PaginationControls";
import { IconButton, Chip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Title from "../components/Title";
import { useTranslation } from "react-i18next";
import TicketsTable from "../components/AllTickets/TicketsTable";
import TicketCard from "../components/AllTickets/TicketCard";
import ViewTicket from "../components/AllTickets/ViewTicket";
import { checkMyTicketsAccess } from "../utils/permissions";
import ViewToggle from "../components/UI/ViewToggle";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { Ticket, TicketStatusWorkflow } from "../types";
import { getStatusWorkflowMappings } from "../services/StatusService";
import { getCurrentUserDetails } from "../config/config";
import { useNavigate } from "react-router-dom";

const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const MyTickets: React.FC = () => {
    const { data, pending, error, apiHandler: searchTicketsPaginatedApiHandler } = useApi<any>();
    const { data: workflowData, apiHandler: workflowApiHandler } = useApi<any>();
    const [statusList, setStatusList] = useState<any[]>([]);
    const [workflowMap, setWorkflowMap] = useState<Record<string, TicketStatusWorkflow[]>>({});

    const navigate = useNavigate();
    const { t } = useTranslation();

    const [search, setSearch] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const showTable = checkMyTicketsAccess('table');
    const showGrid = checkMyTicketsAccess('grid');
    const [viewMode, setViewMode] = useState<"grid" | "table">(showTable ? 'table' : 'grid');
    const [filtered, setFiltered] = useState<Ticket[]>([]);
    const [page, setPage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(5);
    const [gridPageSize, setGridPageSize] = useState(5);
    const pageSize = viewMode === 'grid' ? gridPageSize : tablePageSize;
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");
    const [masterOnly, setMasterOnly] = useState(false);
    const levels = getCurrentUserDetails()?.levels || [];
    const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
    const showLevelFilterToggle = levels.length > 1;
    const [sortBy, setSortBy] = useState<'reportedDate' | 'lastModified'>('reportedDate');
    const sortDirection: 'asc' | 'desc' = 'desc';

    const showSearchBar = checkMyTicketsAccess('searchBar');
    const showStatusFilter = checkMyTicketsAccess('statusFilter');
    const showMasterFilterToggle = checkMyTicketsAccess('masterFilterToggle');
    const showGridTableViewToggle = checkMyTicketsAccess('gridTableViewToggle');

    const priorityConfig: Record<string, { color: string; count: number; label: string }> = {
        Low: { color: 'success.light', count: 1, label: 'Low' },
        Medium: { color: 'warning.light', count: 2, label: 'Medium' },
        High: { color: 'error.main', count: 3, label: 'High' },
        Critical: { color: 'error.dark', count: 4, label: 'Critical' }
    };

    const statusFilterOptions: DropdownOption[] = useMemo(() => (
        [{ label: 'All', value: 'All' }, ...getDropdownOptions(statusList, 'statusName', 'statusId')]
    ), [statusList]);

    const debouncedSearch = useDebounce(search, 300);

    const searchTicketsPaginatedApi = (query: string, statusName?: string, master?: boolean, page: number = 0, size: number = 5) => {
        const user = getCurrentUserDetails();
        const username = user?.username || "";
        const userId = user?.userId || "";
        const roles = user?.role || [];

        const isTeamLead = roles.includes("TEAM_LEAD");
        const isRequester = roles.includes("USER");
        const hasLevels = (user?.levels || []).length > 0;

        let assignedTo: string | undefined = undefined;
        let assignedBy: string | undefined = undefined;
        let requestorId: string | undefined = undefined;

        if (isTeamLead) {
            assignedBy = username;
            requestorId = userId;
        } else if (isRequester) {
            requestorId = userId;
        }

        if (hasLevels && !isTeamLead) {
            assignedTo = username;
            requestorId = userId;
        }

        const username = getCurrentUserDetails()?.username || "";
        return searchTicketsPaginatedApiHandler(() =>
            searchTicketsPaginated(query, statusName, master, page, size, assignedTo, levelFilter, assignedBy, requestorId, sortBy, sortDirection)
        );
    };

    const onIdClick = (id: string) => {
        if (id) {
            setSelectedTicketId(id);
            setSidebarOpen(true);
        }
    };

    const [refreshingTicketId, setRefreshingTicketId] = useState<string | null>(null);

    const searchCurrentTicketsPaginatedApi = useCallback(
        async (id: string) => {
            setRefreshingTicketId(id);
            await searchTicketsPaginatedApi(debouncedSearch, statusFilter === 'All' ? undefined : statusFilter, masterOnly ? true : undefined, page - 1, pageSize);
            setRefreshingTicketId(null);
        },
        [debouncedSearch, statusFilter, masterOnly, levelFilter, page, pageSize, sortBy, sortDirection]
    );

    useEffect(() => {
        searchTicketsPaginatedApi(
            debouncedSearch,
            statusFilter === 'All' ? undefined : statusFilter,
            masterOnly ? true : undefined,
            page - 1,
            pageSize
        );
    }, [debouncedSearch, statusFilter, masterOnly, levelFilter, page, pageSize, sortBy, sortDirection]);

    useEffect(() => {
        getStatuses().then(setStatusList);
        const roles = getCurrentUserDetails()?.role || [];
        workflowApiHandler(() => getStatusWorkflowMappings(roles));
    }, []);

    useEffect(() => {
        if (workflowData) {
            setWorkflowMap(workflowData);
        }
    }, [workflowData]);

    useEffect(() => {
        if (data) {
            const resp = data;
            setTotalPages(resp.totalPages || 1);
            setFiltered(resp.items || resp);
        }
    }, [data]);

    return (
        <div className="container" style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1, marginRight: sidebarOpen ? 400 : 0 }}>
                <Title textKey="My Tickets" />
                <div className="d-flex justify-content-between align-items-center mb-3">
                    {showSearchBar && (
                        <GenericInput
                            label="Search"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ mr: 2, width: 250 }}
                        />
                    )}
                    {showStatusFilter && (
                        <DropdownController
                            label="Status"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusFilterOptions}
                            style={{ width: 180, marginRight: 8 }}
                        />
                    )}
                    {showLevelFilterToggle && levels.map(l => (
                        <Chip
                            key={l}
                            label={l}
                            color={levelFilter === l ? 'primary' : 'default'}
                            variant={levelFilter === l ? 'filled' : 'outlined'}
                            onClick={() => setLevelFilter(prev => prev === l ? undefined : l)}
                            sx={{ mr: 1 }}
                        />
                    ))}
                    {showMasterFilterToggle && (
                        <Chip
                            label={t('Master')}
                            color={masterOnly ? 'primary' : 'default'}
                            variant={masterOnly ? 'filled' : 'outlined'}
                            onClick={() => setMasterOnly(prev => !prev)}
                            sx={{ mr: 1 }}
                        />
                    )}
                    {showGridTableViewToggle && showTable && showGrid && (
                        <ViewToggle
                            value={viewMode}
                            onChange={setViewMode}
                            options={[
                                { icon: 'grid', value: 'grid' },
                                { icon: 'table', value: 'table' }
                            ]}
                        />
                    )}
                </div>
                {pending && <p>{t('Loading...')}</p>}
                {error && <p className="text-danger">{t('Error loading tickets')}</p>}
                {viewMode === 'table' && showTable && (
                    <div>
                        <TicketsTable
                            tickets={filtered}
                            onIdClick={onIdClick}
                            onRowClick={(id: any) => navigate(`/tickets/${id}`)}
                            searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                            refreshingTicketId={refreshingTicketId}
                            statusWorkflows={workflowMap}
                            sortBy={sortBy}
                            onSortChange={(value) => {
                                setSortBy(value as 'reportedDate' | 'lastModified');
                                setPage(1);
                            }}
                        />
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} />
                            <div className="d-flex align-items-center">
                                <IconButton size="small" onClick={() => setTablePageSize(ps => ps > 1 ? ps - 1 : 1)}>
                                    <ArrowDropDownIcon />
                                </IconButton>
                                <GenericInput
                                    type="number"
                                    value={tablePageSize}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value, 10);
                                        if (!isNaN(v) && v > 0) setTablePageSize(v);
                                    }}
                                    size="small"
                                    sx={{ width: 60, mx: 1 }}
                                />
                                <span>/ page</span>
                                <IconButton size="small" onClick={() => setTablePageSize(ps => ps + 1)}>
                                    <ArrowDropUpIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                )}
                {viewMode === 'grid' && showGrid && (
                    <div className="grid-overlay-container">
                        {pending && <div className="grid-overlay" />}
                        <div className="row">
                            {filtered.map((t) => (
                                <div className="col-md-4 mb-3" key={t.id}>
                                    <TicketCard
                                        ticket={t}
                                        priorityConfig={priorityConfig}
                                        statusWorkflows={workflowMap}
                                        searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                                        onClick={() => { setSelectedTicketId(t.id); setSidebarOpen(true); }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} />
                            <div className="d-flex align-items-center">
                                <IconButton size="small" onClick={() => setGridPageSize(ps => ps > 1 ? ps - 1 : 1)}>
                                    <ArrowDropDownIcon />
                                </IconButton>
                                <GenericInput
                                    type="number"
                                    value={gridPageSize}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value, 10);
                                        if (!isNaN(v) && v > 0) setGridPageSize(v);
                                    }}
                                    size="small"
                                    sx={{ width: 60, mx: 1 }}
                                />
                                <span>/ page</span>
                                <IconButton size="small" onClick={() => setGridPageSize(ps => ps + 1)}>
                                    <ArrowDropUpIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ViewTicket ticketId={selectedTicketId} open={sidebarOpen} onClose={() => { setSidebarOpen(false); setSelectedTicketId(null); }} />
        </div>
    );
};

export default MyTickets;

