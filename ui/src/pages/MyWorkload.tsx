import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { searchTicketsPaginated } from "../services/TicketService";
import { getStatuses, setStatusList as setStatusListInSession } from "../utils/Utils";
import PaginationControls from "../components/PaginationControls";
import { IconButton, Chip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Title from "../components/Title";
import { useTranslation } from "react-i18next";
import TicketsTable, { TicketRow } from "../components/AllTickets/TicketsTable";
import TicketCard from "../components/AllTickets/TicketCard";
import ViewTicket from "../components/AllTickets/ViewTicket";
import { checkMyTicketsAccess } from "../utils/permissions";
import ViewToggle from "../components/UI/ViewToggle";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { Ticket, TicketStatusWorkflow } from "../types";
import { getStatusWorkflowMappings, getAllowedStatusListByRoles } from "../services/StatusService";
import { getCurrentUserDetails } from "../config/config";
import { useNavigate } from "react-router-dom";
import DateRangeFilter, { getDateRangeApiParams } from "../components/Filters/DateRangeFilter";
import { DateRangeState } from "../utils/dateUtils";
import { useCategoryFilters } from "../hooks/useCategoryFilters";

const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const MyWorkload: React.FC = () => {
    const { data, pending, error, apiHandler: searchTicketsPaginatedApiHandler } = useApi<any>();
    const { data: workflowData, apiHandler: workflowApiHandler } = useApi<any>();
    const { data: allowedStatusData, apiHandler: allowedStatusApiHandler } = useApi<any>();
    const [statusList, setStatusList] = useState<any[]>([]);
    const [workflowMap, setWorkflowMap] = useState<Record<string, TicketStatusWorkflow[]>>({});
    const [allowedStatuses, setAllowedStatuses] = useState<string[]>([]);

    const navigate = useNavigate();
    const { t } = useTranslation();

    const [search, setSearch] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const showTable = checkMyTicketsAccess('ticketsTable', 'myWorkload');
    const showGrid = checkMyTicketsAccess('grid', 'myWorkload');
    const [viewMode, setViewMode] = useState<"grid" | "table">(showTable ? 'table' : 'grid');
    const [filtered, setFiltered] = useState<TicketRow[]>([]);
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
    const [dateRange, setDateRange] = useState<DateRangeState>({ preset: "ALL" });
    const dateRangeParams = useMemo(() => getDateRangeApiParams(dateRange), [dateRange]);
    const { categoryOptions, subCategoryOptions, loadSubCategories } = useCategoryFilters();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');

    const showSearchBar = checkMyTicketsAccess('searchBar', 'myWorkload');
    const showStatusFilter = checkMyTicketsAccess('statusFilter', 'myWorkload');
    const showMasterFilterToggle = checkMyTicketsAccess('masterFilterToggle', 'myWorkload');
    const showGridTableViewToggle = checkMyTicketsAccess('gridTableViewToggle', 'myWorkload');

    const priorityConfig: Record<string, { color: string; count: number; label: string }> = {
        Low: { color: 'success.light', count: 1, label: 'Low' },
        Medium: { color: 'warning.light', count: 2, label: 'Medium' },
        High: { color: 'error.main', count: 3, label: 'High' },
        Critical: { color: 'error.dark', count: 4, label: 'Critical' }
    };

    const statusFilterOptions: DropdownOption[] = useMemo(() => (
        [{ label: 'All', value: 'All' }, ...getDropdownOptions(statusList, 'statusName', 'statusId')]
    ), [statusList]);

    const sortOptions: DropdownOption[] = useMemo(() => ([
        { label: t('Created Date'), value: 'reportedDate' },
        { label: t('Latest Updated'), value: 'lastModified' },
    ]), [t]);

    const debouncedSearch = useDebounce(search, 300);

    const normalizedCategory = selectedCategory !== 'All' ? selectedCategory : undefined;
    const normalizedSubCategory = selectedSubCategory !== 'All' ? selectedSubCategory : undefined;

    const searchTicketsPaginatedApi = (
        query: string,
        statusName?: string,
        master?: boolean,
        page: number = 0,
        size: number = 5,
    ) => {
        const user = getCurrentUserDetails();
        const username = user?.username || user?.userId || "";

        let statusParam: string | undefined = statusName;

        if (!statusParam && allowedStatuses.length > 0) {
            statusParam = allowedStatuses.join(',');
        }

        const assignedTo = username ? username : undefined;

        return searchTicketsPaginatedApiHandler(() =>
            searchTicketsPaginated(
                query,
                statusParam,
                master,
                page,
                size,
                assignedTo,
                levelFilter,
                undefined,
                undefined,
                sortBy,
                sortDirection,
                undefined,
                undefined,
                dateRangeParams.fromDate,
                dateRangeParams.toDate,
                normalizedCategory,
                normalizedSubCategory,
            )
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

            const user = getCurrentUserDetails();
            const username = user?.username || user?.userId || '';

            let statusParam: string | undefined = statusFilter === 'All' ? undefined : statusFilter;
            if (!statusParam && allowedStatuses.length > 0) {
                statusParam = allowedStatuses.join(',');
            }

            await searchTicketsPaginatedApiHandler(() =>
                searchTicketsPaginated(
                    debouncedSearch,
                    statusParam,
                    masterOnly ? true : undefined,
                    page - 1,
                    pageSize,
                    username || undefined,
                    levelFilter,
                    undefined,
                    undefined,
                    sortBy,
                    sortDirection,
                    undefined,
                    undefined,
                    dateRangeParams.fromDate,
                    dateRangeParams.toDate,
                    normalizedCategory,
                    normalizedSubCategory,
                ),
            );
            setRefreshingTicketId(null);
        },
        [debouncedSearch, statusFilter, masterOnly, levelFilter, page, pageSize, sortBy, sortDirection, dateRangeParams.fromDate, dateRangeParams.toDate, normalizedCategory, normalizedSubCategory, allowedStatuses]
    );

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setSelectedSubCategory('All');
        const categoryId = value === 'All' ? undefined : value;
        loadSubCategories(categoryId);
        setPage(1);
    };

    const handleSubCategoryChange = (value: string) => {
        setSelectedSubCategory(value);
        setPage(1);
    };

    useEffect(() => {
        searchTicketsPaginatedApi(
            debouncedSearch,
            statusFilter === 'All' ? undefined : statusFilter,
            masterOnly ? true : undefined,
            page - 1,
            pageSize
        );
    }, [page, sortBy, sortDirection, dateRangeParams.fromDate, dateRangeParams.toDate]);

    useEffect(() => {
        searchTicketsPaginatedApi(
            debouncedSearch,
            statusFilter === 'All' ? undefined : statusFilter,
            masterOnly ? true : undefined,
            0,
            pageSize
        );
    }, [debouncedSearch, statusFilter, masterOnly, levelFilter, pageSize, allowedStatuses, dateRangeParams.fromDate, dateRangeParams.toDate, selectedCategory, selectedSubCategory]);

    useEffect(() => {
        const roles = getCurrentUserDetails()?.role || [];
        workflowApiHandler(() => getStatusWorkflowMappings(roles));
        allowedStatusApiHandler(() => getAllowedStatusListByRoles(roles));
    }, []);

    useEffect(() => {
        if (allowedStatusData) {
            setAllowedStatuses(allowedStatusData);
            getStatuses().then(list => {
                const filtered = list.filter((s: any) => allowedStatusData.includes(s.statusId));
                setStatusList(filtered);
                setStatusListInSession(filtered);
            });
        }
    }, [allowedStatusData]);

    useEffect(() => {
        if (workflowData) {
            setWorkflowMap(workflowData);
        }
    }, [workflowData]);

    useEffect(() => {
        if (data) {
            const resp = data;
            let items = resp.items || resp;
            const roles = (getCurrentUserDetails()?.role || []).map(String);
            if (roles.some(role => role === "4" || role === "TEAM_LEAD")) {
                const teamLeadStatuses = new Set(["1", "2", "OPEN", "ASSIGNED"]);
                items = items.filter((t: TicketRow) => teamLeadStatuses.has(String(t.statusId ?? "")));
            }
            if (roles.includes("9")) {
                const escalatedStatuses = new Set(["6", "ESCALATED"]);
                items = items.filter((t: TicketRow) => escalatedStatuses.has(String(t.statusId ?? "")));
            }
            setTotalPages(resp.totalPages || 1);
            setFiltered(items);
        }
    }, [data]);

    return (
        <div className="container" style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1, marginRight: sidebarOpen ? 400 : 0 }}>
                <Title textKey="My Workload" />
                <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
                    {showSearchBar && (
                        <GenericInput
                            label="Search"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ mr: 2, width: 250 }}
                            placeholder="Search by Ticket Id, Requestor Name, Subject"
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
                    <DropdownController
                        label="Category"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        style={{ width: 200 }}
                    />
                    {selectedCategory !== 'All' && (
                        <DropdownController
                            label="Sub Category"
                            value={selectedSubCategory}
                            onChange={handleSubCategoryChange}
                            options={subCategoryOptions}
                            style={{ width: 220 }}
                        />
                    )}
                    <DateRangeFilter value={dateRange} onChange={setDateRange} />
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
                        <div className="d-flex ms-auto">
                            <ViewToggle
                                value={viewMode}
                                onChange={setViewMode}
                                options={[
                                    { icon: 'grid', value: 'grid' },
                                    { icon: 'table', value: 'table' }
                                ]}
                            />
                        </div>
                    )}
                </div>
                {/* {pending && <p>{t('Loading...')}</p>}
                {error && <p className="text-danger">{t('Error loading tickets')}</p>} */}
                {(viewMode === 'table' && showTable) || (viewMode === 'grid' && showGrid) ? (
                    <div className="d-flex justify-content-end mb-2 w-100">
                        <DropdownController
                            label={t('Sort By')}
                            value={sortBy}
                            onChange={(value) => {
                                setSortBy(value as 'reportedDate' | 'lastModified');
                                setPage(1);
                            }}
                            options={sortOptions}
                            style={{ width: 200 }}
                        />
                    </div>
                ) : null}
                {viewMode === 'table' && showTable && (
                    <div>
                        <TicketsTable
                            tickets={filtered}
                            onIdClick={onIdClick}
                            onRowClick={(id: any) => navigate(`/tickets/${id}`)}
                            searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                            refreshingTicketId={refreshingTicketId}
                            statusWorkflows={workflowMap}
                            permissionPathPrefix="myWorkload"
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

export default MyWorkload;

