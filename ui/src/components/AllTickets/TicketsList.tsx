import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useApi } from "../../hooks/useApi";
import { useDebounce } from "../../hooks/useDebounce";
import { searchTicketsPaginated } from "../../services/TicketService";
import {
    getStatuses,
    setStatusList as setStatusListInSession,
} from "../../utils/Utils";
import Title from "../Title";
import TicketsTable, { TicketRow } from "./TicketsTable";
import TicketCard from "./TicketCard";
import ViewTicket from "./ViewTicket";
import ViewToggle from "../UI/ViewToggle";
import DropdownController from "../UI/Dropdown/DropdownController";
import { DropdownOption } from "../UI/Dropdown/GenericDropdown";
import PaginationControls from "../PaginationControls";
import { checkMyTicketsAccess } from "../../utils/permissions";
import { TicketStatusWorkflow } from "../../types";
import { getStatusWorkflowMappings, getAllowedStatusListByRoles } from "../../services/StatusService";
import { getCurrentUserDetails } from "../../config/config";
import DateRangeFilter, { getDateRangeApiParams } from "../Filters/DateRangeFilter";
import { DateRangeState } from "../../utils/dateUtils";
import { useCategoryFilters } from "../../hooks/useCategoryFilters";
import GenericInput from "../UI/Input/GenericInput";

export interface TicketsListFilterState {
    search: string;
    statusFilter: string;
    masterOnly: boolean;
    levelFilter?: string;
    sortBy: "reportedDate" | "lastModified";
    sortDirection: "asc" | "desc";
    viewMode: "grid" | "table";
    page: number;
    tablePageSize: number;
    gridPageSize: number;
    dateRange: DateRangeState;
    selectedCategory: string;
    selectedSubCategory: string;
}

export interface TicketsListSearchOverrides {
    query?: string;
    statusName?: string;
    master?: boolean;
    page?: number;
    size?: number;
    assignedTo?: string;
    levelId?: string;
    assignedBy?: string;
    requestorId?: string;
    sortBy?: string;
    direction?: string;
    severity?: string;
    createdBy?: string;
    fromDate?: string;
    toDate?: string;
    categoryId?: string;
    subCategoryId?: string;
}

interface TicketsListProps {
    titleKey: string;
    permissionPathPrefix?: string;
    buildSearchOverrides?: (filters: TicketsListFilterState) => TicketsListSearchOverrides;
    transformTickets?: (tickets: TicketRow[], filters: TicketsListFilterState, response: any) => TicketRow[];
    onRowClick?: (id: string) => void;
    onTicketSelectChange?: (ticketId: string | null) => void;
    restrictStatusesToAllowed?: boolean;
    allowGrid?: boolean;
    allowTable?: boolean;
    tableOptions?: {
        showSeverityColumn?: boolean;
        onRecommendEscalation?: (id: string) => void;
        onRcaClick?: (id: string, status?: TicketRow["rcaStatus"]) => void;
        permissionPathPrefix?: string;
    };
    getViewTicketProps?: (selectedTicketId: string | null) => Partial<React.ComponentProps<typeof ViewTicket>>;
}

const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map((item: T) => ({
            label: String(item[labelKey]),
            value: (item as any)[valueKey],
        }))
        : [];

const priorityConfig: Record<string, { color: string; count: number; label: string }> = {
    Low: { color: "success.light", count: 1, label: "Low" },
    Medium: { color: "warning.light", count: 2, label: "Medium" },
    High: { color: "error.main", count: 3, label: "High" },
    Critical: { color: "error.dark", count: 4, label: "Critical" },
};

const TicketsList: React.FC<TicketsListProps> = ({
    titleKey,
    permissionPathPrefix = "myTickets",
    buildSearchOverrides,
    transformTickets,
    onRowClick,
    onTicketSelectChange,
    restrictStatusesToAllowed = true,
    allowGrid = true,
    allowTable = true,
    tableOptions,
    getViewTicketProps,
}) => {
    const { t } = useTranslation();
    const { data, pending, apiHandler: searchTicketsPaginatedApiHandler } = useApi<any>();
    const { data: workflowData, apiHandler: workflowApiHandler } = useApi<any>();
    const { data: allowedStatusData, apiHandler: allowedStatusApiHandler } = useApi<any>();

    const [statusList, setStatusList] = useState<any[]>([]);
    const [workflowMap, setWorkflowMap] = useState<Record<string, TicketStatusWorkflow[]>>({});
    const [allowedStatuses, setAllowedStatuses] = useState<string[]>([]);

    const [search, setSearch] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const showTablePermission = allowTable && checkMyTicketsAccess("ticketsTable", permissionPathPrefix);
    const showGridPermission = allowGrid && checkMyTicketsAccess("grid", permissionPathPrefix);
    const initialViewMode: "grid" | "table" = showTablePermission ? "table" : "grid";
    const [viewMode, setViewMode] = useState<"grid" | "table">(initialViewMode);

    const [tickets, setTickets] = useState<TicketRow[]>([]);
    const [page, setPage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(5);
    const [gridPageSize, setGridPageSize] = useState(5);
    const pageSize = viewMode === "grid" ? gridPageSize : tablePageSize;
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");
    const [masterOnly, setMasterOnly] = useState(false);
    const levels = getCurrentUserDetails()?.levels || [];
    const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
    const showLevelFilterToggle = levels.length > 1;
    const [sortBy, setSortBy] = useState<"reportedDate" | "lastModified">("reportedDate");
    const sortDirection: "asc" | "desc" = "desc";
    const [refreshingTicketId, setRefreshingTicketId] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState<DateRangeState>({ preset: "ALL" });
    const dateRangeParams = useMemo(() => getDateRangeApiParams(dateRange), [dateRange]);

    const { categoryOptions, subCategoryOptions, loadSubCategories } = useCategoryFilters();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");

    const debouncedSearch = useDebounce(search, 300);

    const showSearchBar = checkMyTicketsAccess("searchBar", permissionPathPrefix);
    const showStatusFilter = checkMyTicketsAccess("statusFilter", permissionPathPrefix);
    const showMasterFilterToggle = checkMyTicketsAccess("masterFilterToggle", permissionPathPrefix);
    const showGridTableViewToggle = checkMyTicketsAccess("gridTableViewToggle", permissionPathPrefix);

    const statusFilterOptions: DropdownOption[] = useMemo(
        () => [{ label: "All", value: "All" }, ...getDropdownOptions(statusList, "statusName", "statusId")],
        [statusList],
    );

    const sortOptions: DropdownOption[] = useMemo(
        () => [
            { label: t("Created Date"), value: "reportedDate" },
            { label: t("Latest Updated"), value: "lastModified" },
        ],
        [t],
    );

    const normalizedCategory = selectedCategory !== "All" ? selectedCategory : undefined;
    const normalizedSubCategory = selectedSubCategory !== "All" ? selectedSubCategory : undefined;

    const filterState: TicketsListFilterState = useMemo(
        () => ({
            search,
            statusFilter,
            masterOnly,
            levelFilter,
            sortBy,
            sortDirection,
            viewMode,
            page,
            tablePageSize,
            gridPageSize,
            dateRange,
            selectedCategory,
            selectedSubCategory,
        }),
        [
            search,
            statusFilter,
            masterOnly,
            levelFilter,
            sortBy,
            sortDirection,
            viewMode,
            page,
            tablePageSize,
            gridPageSize,
            dateRange,
            selectedCategory,
            selectedSubCategory,
        ],
    );

    const callSearch = useCallback(
        (
            overrides?: TicketsListSearchOverrides,
            options?: { pageOverride?: number; sizeOverride?: number }
        ) => {
            const effectivePage = options?.pageOverride ?? page;
            const effectiveSize = options?.sizeOverride ?? pageSize;

            let statusParam: string | undefined = statusFilter === "All" ? undefined : statusFilter;
            if (!statusParam && allowedStatuses.length > 0) {
                statusParam = allowedStatuses.join(",");
            }
            if (overrides?.statusName !== undefined) {
                statusParam = overrides.statusName;
            }

            const masterParam = overrides?.master !== undefined ? overrides.master : masterOnly ? true : undefined;

            const requestOverrides = buildSearchOverrides ? buildSearchOverrides({ ...filterState, page: effectivePage }) : {};
            const mergedOverrides: TicketsListSearchOverrides = {
                ...requestOverrides,
                ...overrides,
            };

            const queryParam = mergedOverrides.query !== undefined ? mergedOverrides.query : debouncedSearch;
            const statusParamU = mergedOverrides.statusName === "All" ? undefined : statusParam;
            const pageParam = mergedOverrides.page ?? effectivePage - 1;
            const sizeParam = mergedOverrides.size ?? effectiveSize;
            const levelParam = mergedOverrides.levelId ?? levelFilter;
            const sortByParam = mergedOverrides.sortBy ?? sortBy;
            const directionParam = mergedOverrides.direction ?? sortDirection;
            const fromDateParam = mergedOverrides.fromDate ?? dateRangeParams.fromDate;
            const toDateParam = mergedOverrides.toDate ?? dateRangeParams.toDate;
            const categoryParam = mergedOverrides.categoryId ?? normalizedCategory;
            const subCategoryParam = mergedOverrides.subCategoryId ?? normalizedSubCategory;

            return searchTicketsPaginatedApiHandler(() =>
                searchTicketsPaginated(
                    queryParam,
                    statusParamU,
                    masterParam,
                    pageParam,
                    sizeParam,
                    mergedOverrides.assignedTo,
                    levelParam,
                    mergedOverrides.assignedBy,
                    mergedOverrides.requestorId,
                    sortByParam,
                    directionParam,
                    mergedOverrides.severity,
                    mergedOverrides.createdBy,
                    fromDateParam,
                    toDateParam,
                    categoryParam,
                    subCategoryParam,
                ),
            );
        },
        [
            allowedStatuses,
            buildSearchOverrides,
            dateRangeParams.fromDate,
            dateRangeParams.toDate,
            debouncedSearch,
            filterState,
            levelFilter,
            masterOnly,
            normalizedCategory,
            normalizedSubCategory,
            page,
            pageSize,
            searchTicketsPaginatedApiHandler,
            sortBy,
            sortDirection,
            statusFilter,
        ],
    );

    const searchCurrentTicketsPaginatedApi = useCallback(
        async (id: string) => {
            setRefreshingTicketId(id);
            await callSearch(undefined, { pageOverride: page, sizeOverride: pageSize });
            setRefreshingTicketId(null);
        },
        [callSearch, page, pageSize],
    );

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setSelectedSubCategory("All");
        const categoryId = value === "All" ? undefined : value;
        loadSubCategories(categoryId);
        setPage(1);
    };

    const handleSubCategoryChange = (value: string) => {
        setSelectedSubCategory(value);
        setPage(1);
    };

    const handleTicketSelection = (id: string | null, openSidebar: boolean = false) => {
        setSelectedTicketId(id);
        setSidebarOpen(openSidebar);
        onTicketSelectChange?.(id);
    };

    useEffect(() => {
        const roles = getCurrentUserDetails()?.role || [];
        workflowApiHandler(() => getStatusWorkflowMappings(roles));
        if (restrictStatusesToAllowed) {
            allowedStatusApiHandler(() => getAllowedStatusListByRoles(roles));
        } else {
            getStatuses().then(setStatusList);
        }
    }, [allowedStatusApiHandler, restrictStatusesToAllowed, workflowApiHandler]);

    useEffect(() => {
        if (restrictStatusesToAllowed && allowedStatusData) {
            setAllowedStatuses(allowedStatusData);
            getStatuses().then(list => {
                const filteredStatuses = list.filter((s: any) => allowedStatusData.includes(s.statusId));
                setStatusList(filteredStatuses);
                setStatusListInSession(filteredStatuses);
            });
        }
    }, [allowedStatusData, restrictStatusesToAllowed]);

    useEffect(() => {
        if (workflowData) {
            setWorkflowMap(workflowData);
        }
    }, [workflowData]);

    useEffect(() => {
        callSearch();
    }, [
        callSearch,
        debouncedSearch,
        statusFilter,
        masterOnly,
        levelFilter,
        page,
        pageSize,
        sortBy,
        sortDirection,
        dateRangeParams.fromDate,
        dateRangeParams.toDate,
        selectedCategory,
        selectedSubCategory,
    ]);

    useEffect(() => {
        if (data) {
            const resp = data;
            const items: TicketRow[] = resp.items || resp;
            const transformed = transformTickets ? transformTickets(items, filterState, resp) : items;
            setTotalPages(resp.totalPages || 1);
            setTickets(transformed);
        }
    }, [data, filterState, transformTickets]);

    useEffect(() => {
        if (showTablePermission && !showGridPermission) {
            setViewMode("table");
        } else if (showGridPermission && !showTablePermission) {
            setViewMode("grid");
        }
    }, [showGridPermission, showTablePermission]);

    useEffect(() => {
        setPage(1);
    }, [viewMode]);

    const viewTicketProps = getViewTicketProps?.(selectedTicketId) ?? {};

    return (
        <div className="container" style={{ display: "flex" }}>
            <div style={{ flexGrow: 1, marginRight: sidebarOpen ? 400 : 0 }}>
                <Title textKey={titleKey} />
                <div className="d-flex flex-wrap align-items-center mb-3">
                    {showSearchBar && (
                        <GenericInput
                            label="Search"
                            size="small"
                            className="col-3 pe-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Ticket Id, Requestor Name, Subject"
                        />
                    )}
                    {showStatusFilter && (
                        <DropdownController
                            label="Status"
                            className="col-3 px-1"
                            value={statusFilter}
                            onChange={(value) => { setStatusFilter(value); setPage(1); }}
                            options={statusFilterOptions}
                        // style={{ width: 180, marginRight: 8 }}
                        />
                    )}
                    <DropdownController
                        label="Category"
                        value={selectedCategory}
                        className="col-3 px-1"
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                    // style={{ width: 200 }}
                    />
                    {selectedCategory !== "All" ? (
                        <DropdownController
                            label="Sub Category"
                            value={selectedSubCategory}
                            className="col-3 ps-1"
                            onChange={handleSubCategoryChange}
                            options={subCategoryOptions}
                        // style={{ width: 220 }}
                        />
                    )
                        : <div className="d-flex col-3"></div>}
                    <DateRangeFilter value={dateRange} onChange={setDateRange} />
                    {showLevelFilterToggle && levels.map(level => (
                        <Chip
                            key={level}
                            label={level}
                            color={levelFilter === level ? "primary" : "default"}
                            variant={levelFilter === level ? "filled" : "outlined"}
                            onClick={() => {
                                setLevelFilter(prev => prev === level ? undefined : level);
                                setPage(1);
                            }}
                            sx={{ mr: 1 }}
                        />
                    ))}
                    {showMasterFilterToggle && (
                        <Chip
                            label={t("Master")}
                            color={masterOnly ? "primary" : "default"}
                            variant={masterOnly ? "filled" : "outlined"}
                            onClick={() => { setMasterOnly(prev => !prev); setPage(1); }}
                            sx={{ mr: 1 }}
                        />
                    )}
                    {showGridTableViewToggle && showTablePermission && showGridPermission && (
                        <div className="d-flex ms-auto">
                            <ViewToggle
                                value={viewMode}
                                onChange={(value: any) => setViewMode(value)}
                                options={[
                                    { icon: "grid", value: "grid" },
                                    { icon: "table", value: "table" },
                                ]}
                            />
                        </div>
                    )}
                </div>
                {(viewMode === "table" && showTablePermission) || (viewMode === "grid" && showGridPermission) ? (
                    <div className="d-flex justify-content-end mb-2 w-100">
                        <DropdownController
                            label={t("Sort By")}
                            value={sortBy}
                            onChange={(value) => {
                                setSortBy(value as "reportedDate" | "lastModified");
                                setPage(1);
                            }}
                            options={sortOptions}
                            style={{ width: 200 }}
                        />
                    </div>
                ) : null}
                {viewMode === "table" && showTablePermission && (
                    <div>
                        <TicketsTable
                            tickets={tickets}
                            onIdClick={(id) => handleTicketSelection(id, true)}
                            onRowClick={(id) => onRowClick?.(id)}
                            searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                            refreshingTicketId={refreshingTicketId}
                            statusWorkflows={workflowMap}
                            onRecommendEscalation={tableOptions?.onRecommendEscalation ? (id) => {
                                handleTicketSelection(id, true);
                                tableOptions.onRecommendEscalation?.(id);
                            } : undefined}
                            showSeverityColumn={tableOptions?.showSeverityColumn}
                            onRcaClick={tableOptions?.onRcaClick}
                            permissionPathPrefix={tableOptions?.permissionPathPrefix ?? permissionPathPrefix}
                        />
                        <PaginationControls
                            className="justify-content-between align-items-center mt-3 w-100"
                            page={page}
                            totalPages={totalPages}
                            onChange={(_, val) => setPage(val)}
                            pageSize={tablePageSize}
                            onPageSizeChange={(value) => setTablePageSize(value)}
                        />
                    </div>
                )}
                {viewMode === "grid" && showGridPermission && (
                    <div className="grid-overlay-container">
                        {pending && <div className="grid-overlay" />}
                        <div className="row">
                            {tickets.map(ticket => (
                                <div className="col-md-4 mb-3" key={ticket.id}>
                                    <TicketCard
                                        ticket={ticket}
                                        priorityConfig={priorityConfig}
                                        statusWorkflows={workflowMap}
                                        searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                                        onClick={() => handleTicketSelection(ticket.id, true)}
                                    />
                                </div>
                            ))}
                        </div>
                        <PaginationControls
                            className="justify-content-between align-items-center mt-3 w-100"
                            page={page}
                            totalPages={totalPages}
                            onChange={(_, val) => setPage(val)}
                            pageSize={gridPageSize}
                            onPageSizeChange={(value) => setGridPageSize(value)}
                        />
                    </div>
                )}
            </div>
            <ViewTicket
                ticketId={selectedTicketId}
                open={sidebarOpen}
                onClose={() => handleTicketSelection(null, false)}
                {...viewTicketProps}
            />
        </div>
    );
};

export default TicketsList;
