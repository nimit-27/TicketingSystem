import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Chip } from "@mui/material";
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
import FeedbackModal from "../Feedback/FeedbackModal";
import { getDistricts, getRegions, getZones } from "../../services/LocationService";
import { getIssueTypes } from "../../services/IssueTypeService";
import AssigneeFilterDropdown from "./AssigneeFilterDropdown";

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
    selectedAssignee: string;
    selectedDateParam: string;
    allowedStatuses?: string[];
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
    dateParam?: string;
    fromDate?: string;
    toDate?: string;
    categoryId?: string;
    subCategoryId?: string;
    statusParam?: string;
    zoneCode?: string;
    regionCode?: string;
    districtCode?: string;
    issueTypeId?: string;
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
    allowAll: boolean;
    headerRightContent?: React.ReactNode;
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
    allowAll,
    headerRightContent
}) => {
    const { t } = useTranslation();
    const { data: allowedStatusData, pending: allowedStatusPending, success: allowedStatusSuccess, apiHandler: allowedStatusApiHandler } = useApi<any>();
    const { data, pending, apiHandler: searchTicketsPaginatedApiHandler } = useApi<any>();
    const { data: workflowData, apiHandler: workflowApiHandler } = useApi<any>();
    const { data: zonesResponse = [], apiHandler: getZonesApiHandler } = useApi<any[]>();
    const { data: regionsResponse = [], apiHandler: getRegionsApiHandler } = useApi<any[]>();
    const { data: districtsResponse = [], apiHandler: getDistrictsApiHandler } = useApi<any[]>();
    const { data: issueTypesResponse = [], apiHandler: getIssueTypesApiHandler } = useApi<any[]>();

    const [statusList, setStatusList] = useState<any[]>([]);
    const [workflowMap, setWorkflowMap] = useState<Record<string, TicketStatusWorkflow[]>>({});
    const [allowedStatuses, setAllowedStatuses] = useState<string[]>([]);

    const [search, setSearch] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [selectedTicketIdForFeedback, setSelectedTicketIdForFeedback] = useState('');
    const [selectedTicketFeedbackStatus, setSelectedTicketFeedbackStatus] = useState('');

    const showTablePermission = allowTable && checkMyTicketsAccess("ticketsTable", permissionPathPrefix);
    const showGridPermission = allowGrid && checkMyTicketsAccess("grid", permissionPathPrefix);
    const initialViewMode: "grid" | "table" = showTablePermission ? "table" : "grid";
    const [viewMode, setViewMode] = useState<"grid" | "table">(initialViewMode);

    const [tickets, setTickets] = useState<TicketRow[]>([]);
    const [page, setPage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(20);
    const [gridPageSize, setGridPageSize] = useState(20);
    const pageSize = viewMode === "grid" ? gridPageSize : tablePageSize;
    const [totalPages, setTotalPages] = useState(1);
    const [filteredTicketCount, setFilteredTicketCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState("All");
    const [masterOnly, setMasterOnly] = useState(false);
    const userDetails = getCurrentUserDetails();
    const levels = userDetails?.levels || [];
    const defaultZoneCode = userDetails?.zoneCode ? String(userDetails.zoneCode) : "All";
    const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
    const showLevelFilterToggle = levels.length > 1;
    const [sortBy, setSortBy] = useState<"reportedDate" | "lastModified">("reportedDate");
    const sortDirection: "asc" | "desc" = "desc";
    const [refreshingTicketId, setRefreshingTicketId] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState<DateRangeState>({ preset: "ALL" });
    const [selectedDateParam, setSelectedDateParam] = useState<string>("reported_date");
    const dateRangeParams = useMemo(() => getDateRangeApiParams(dateRange), [dateRange]);

    const { categoryOptions, subCategoryOptions, loadSubCategories, resetSubCategories } = useCategoryFilters();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
    const [selectedZone, setSelectedZone] = useState<string>(defaultZoneCode);
    const [selectedRegion, setSelectedRegion] = useState<string>("All");
    const [selectedRegionHrmsCode, setSelectedRegionHrmsCode] = useState<string>("All");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
    const [selectedIssueType, setSelectedIssueType] = useState<string>("All");
    const [selectedAssignee, setSelectedAssignee] = useState<string>("All");

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

    const dateParamOptions: DropdownOption[] = useMemo(
        () => [
            { label: "Created On", value: "reported_date" },
            { label: "Last Modified", value: "last_modified" },
            { label: "Last Modified Status Date", value: "last_modified_status_date" },
        ],
        [],
    );

    const zoneOptions: DropdownOption[] = useMemo(
        () => [{ label: "All", value: "All" }, ...((zonesResponse as any)?.data ?? zonesResponse ?? []).map((zone: any) => ({
            label: zone.zoneName ? `${zone.zoneName} (${zone.zoneCode})` : String(zone.zoneCode ?? ""),
            value: String(zone.zoneCode ?? ""),
        }))],
        [zonesResponse],
    );

    const regionOptions = useMemo(
        () => [{ label: "All", value: "All" }, ...((regionsResponse as any)?.data ?? regionsResponse ?? []).map((region: any) => ({
            label: region.regionName ?? "",
            value: String(region.regionCode ?? ""),
            hrmsRegCode: region.hrmsRegCode ?? "",
        }))],
        [regionsResponse],
    );

    const districtOptions: DropdownOption[] = useMemo(
        () => [{ label: "All", value: "All" }, ...((districtsResponse as any)?.data ?? districtsResponse ?? []).map((district: any) => ({
            label: district.districtName ? `${district.districtName} (${district.districtCode})` : String(district.districtCode ?? ""),
            value: String(district.districtCode ?? ""),
        }))],
        [districtsResponse],
    );

    const issueTypeOptions: DropdownOption[] = useMemo(
        () => [{ label: "All", value: "All" }, ...((issueTypesResponse as any)?.data ?? issueTypesResponse ?? []).map((issueType: any) => ({
            label: issueType.issueTypeLabel ?? "",
            value: String(issueType.issueTypeId ?? ""),
        }))],
        [issueTypesResponse],
    );

    const selectedIssueTypeLabel = useMemo(
        () => issueTypeOptions.find((option) => option.value === selectedIssueType)?.label,
        [issueTypeOptions, selectedIssueType],
    );

    const handleFeedback = (ticketId: string, feedbackStatus: string) => {
        setFeedbackOpen(true)
        setSelectedTicketIdForFeedback(ticketId);
        setSelectedTicketFeedbackStatus(feedbackStatus)
    }

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("All");
        setMasterOnly(false);
        setLevelFilter(undefined);
        setSortBy("reportedDate");
        setDateRange({ preset: "ALL" });
        setSelectedDateParam("reported_date");
        setSelectedCategory("All");
        setSelectedSubCategory("All");
        setSelectedZone(defaultZoneCode);
        setSelectedRegion("All");
        setSelectedRegionHrmsCode("All");
        setSelectedDistrict("All");
        setSelectedIssueType("All");
        setSelectedAssignee("All");
        setPage(1);
        resetSubCategories();
        loadSubCategories();
    };

    const normalizedCategory = selectedCategory !== "All" ? selectedCategory : undefined;
    const normalizedSubCategory = selectedSubCategory !== "All" ? selectedSubCategory : undefined;
    const normalizedZone = selectedZone !== "All" ? selectedZone : undefined;
    const normalizedRegion = selectedRegion !== "All" ? selectedRegion : undefined;
    const normalizedDistrict = selectedDistrict !== "All" ? selectedDistrict : undefined;
    const normalizedIssueType = selectedIssueType !== "All" ? selectedIssueType : undefined;
    const normalizedAssignee = selectedAssignee !== "All" ? selectedAssignee : undefined;

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
            selectedAssignee,
            selectedDateParam,
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
            selectedAssignee,
            selectedDateParam,
        ],
    );

    const callSearch = useCallback(
        (
            overrides?: TicketsListSearchOverrides,
            options?: { pageOverride?: number; sizeOverride?: number }
        ) => {
            const effectivePage = options?.pageOverride ?? page;
            const effectiveSize = options?.sizeOverride ?? pageSize;

            if(!allowAll) {
                if(!allowedStatusSuccess) return
            }

            let statusParam: string | undefined = statusFilter === "All" ? undefined : statusFilter;

            if (overrides?.statusName !== undefined) {
                statusParam = overrides.statusName;
            }

            const masterParam = overrides?.master !== undefined ? overrides.master : masterOnly ? true : undefined;

            const requestOverrides = buildSearchOverrides ? buildSearchOverrides({ ...filterState, page: effectivePage, allowedStatuses: allowedStatusData }) : {};
            const mergedOverrides: TicketsListSearchOverrides = {
                ...requestOverrides,
                ...overrides,
            };

            const queryParam = mergedOverrides.query !== undefined ? mergedOverrides.query : debouncedSearch;
            const statusParamU = mergedOverrides.statusParam ?? statusParam;
            // const statusParamU = mergedOverrides.statusName === "All" ? undefined : statusParam;
            const pageParam = mergedOverrides.page ?? effectivePage - 1;
            const sizeParam = mergedOverrides.size ?? effectiveSize;
            const levelParam = mergedOverrides.levelId ?? levelFilter;
            const sortByParam = mergedOverrides.sortBy ?? sortBy;
            const directionParam = mergedOverrides.direction ?? sortDirection;
            const fromDateParam = mergedOverrides.fromDate ?? dateRangeParams.fromDate;
            const toDateParam = mergedOverrides.toDate ?? dateRangeParams.toDate;
            const dateParam = mergedOverrides.dateParam ?? selectedDateParam;
            const categoryParam = mergedOverrides.categoryId ?? normalizedCategory;
            const subCategoryParam = mergedOverrides.subCategoryId ?? normalizedSubCategory;
            const zoneParam = mergedOverrides.zoneCode ?? normalizedZone;
            const regionParam = mergedOverrides.regionCode ?? normalizedRegion;
            const districtParam = mergedOverrides.districtCode ?? normalizedDistrict;
            const issueTypeParam = mergedOverrides.issueTypeId ?? normalizedIssueType;
            const assignedToParam = mergedOverrides.assignedTo ?? normalizedAssignee;

            return searchTicketsPaginatedApiHandler(() => {
                console.log({ allowedStatusSuccess })
                return searchTicketsPaginated(
                    queryParam,
                    statusParamU,
                    masterParam,
                    pageParam,
                    sizeParam,
                    assignedToParam,
                    levelParam,
                    mergedOverrides.assignedBy,
                    mergedOverrides.requestorId,
                    sortByParam,
                    directionParam,
                    mergedOverrides.severity,
                    mergedOverrides.createdBy,
                    dateParam,
                    fromDateParam,
                    toDateParam,
                    categoryParam,
                    subCategoryParam,
                    zoneParam,
                    regionParam,
                    districtParam,
                    issueTypeParam,
                )
            }
            );
        },
        [
            allowedStatuses,
            allowedStatusSuccess,
            buildSearchOverrides,
            dateRangeParams.fromDate,
            dateRangeParams.toDate,
            debouncedSearch,
            filterState,
            levelFilter,
            masterOnly,
            normalizedCategory,
            normalizedSubCategory,
            normalizedZone,
            normalizedRegion,
            normalizedDistrict,
            normalizedIssueType,
            normalizedAssignee,
            page,
            pageSize,
            sortBy,
            sortDirection,
            statusFilter,
            selectedDateParam,
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

    const handleZoneChange = (value: string) => {
        setSelectedZone(value);
        setPage(1);
    };

    const handleRegionChange = (value: string) => {
        setSelectedRegion(value);
        const matchingOption = (regionOptions as Array<{ value: string; hrmsRegCode?: string }>).find((option) => option.value === value);
        setSelectedRegionHrmsCode(matchingOption?.hrmsRegCode ?? "All");
        setPage(1);
    };

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value);
        setPage(1);
    };

    const handleIssueTypeChange = (value: string) => {
        setSelectedIssueType(value);
        setPage(1);
    };

    const handleAssigneeChange = (value: string) => {
        setSelectedAssignee(value);
        setPage(1);
    };

    const handleFeedbackClose = () => {
        setFeedbackOpen(false);
    };

    const handleTicketSelection = (id: string | null, openSidebar: boolean = false) => {
        setSelectedTicketId(id);
        setSidebarOpen(openSidebar);
        onTicketSelectChange?.(id);
    };

    useEffect(() => {
        const roles = getCurrentUserDetails()?.role || [];
        workflowApiHandler(() => getStatusWorkflowMappings(roles));
        getZonesApiHandler(() => getZones());
        getIssueTypesApiHandler(() => getIssueTypes());
        if (restrictStatusesToAllowed) {
            allowedStatusApiHandler(() => getAllowedStatusListByRoles(roles));
        } else {
            getStatuses().then(setStatusList);
        }
    }, [allowedStatusApiHandler, getIssueTypesApiHandler, getZonesApiHandler, restrictStatusesToAllowed, workflowApiHandler]);

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
        if (selectedZone === "All") {
            setSelectedRegion("All");
            setSelectedRegionHrmsCode("All");
            setSelectedDistrict("All");
            return;
        }

        setSelectedRegion("All");
        setSelectedRegionHrmsCode("All");
        setSelectedDistrict("All");
        getRegionsApiHandler(() => getRegions(selectedZone));
    }, [getRegionsApiHandler, selectedZone]);

    useEffect(() => {
        if (selectedRegionHrmsCode === "All") {
            setSelectedDistrict("All");
            return;
        }

        setSelectedDistrict("All");
        getDistrictsApiHandler(() => getDistricts(selectedRegionHrmsCode));
    }, [getDistrictsApiHandler, selectedRegionHrmsCode]);

    useEffect(() => {
        if (workflowData) {
            setWorkflowMap(workflowData);
        }
    }, [workflowData]);

    useEffect(() => {
        callSearch();
    }, [
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
        selectedZone,
        selectedRegion,
        selectedDistrict,
        selectedIssueType,
        selectedAssignee,
        allowedStatusSuccess,
    ]);

    useEffect(() => {
        if (data) {
            const resp = data;
            const items: TicketRow[] = resp.items || resp;
            const transformed = transformTickets ? transformTickets(items, filterState, resp) : items;
            setTotalPages(resp.totalPages || 1);
            setFilteredTicketCount(resp.filteredTotalElements ?? resp.totalElements ?? transformed.length ?? 0);
            setTickets(transformed);
        }
    }, [data, filterState]);

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
        <div className="" style={{ display: "flex" }}>
            <div style={{ flexGrow: 1, marginRight: sidebarOpen ? 400 : 0 }}>
                <Title textKey={titleKey} rightContent={headerRightContent} />
                <div className="d-flex flex-wrap align-items-center mb-3">
                    {/* -------- FILTERS --------- */}

                    {/* SEARCH FILTER */}
                    {showSearchBar && (
                        <GenericInput
                            label="Search"
                            className="col-3 pe-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Ticket Id, Requestor Name, Subject"
                        />
                    )}

                    {/* STATUS DROPDOWN FILTER */}
                    {showStatusFilter && (
                        <DropdownController
                            label="Status"
                            className="col-3 px-1"
                            value={statusFilter}
                            onChange={(value) => { setStatusFilter(value); setPage(1); }}
                            options={statusFilterOptions}
                        />
                    )}

                    {/* CATEGORY DROPDOWN FILTER */}
                    <DropdownController
                        label="Module"
                        value={selectedCategory}
                        className="col-3 px-1"
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                    />

                    {/* SUBCATEGORY DROPDOWN FILTER */}
                    {selectedCategory !== "All"
                        ? <DropdownController
                            label="Sub Module"
                            value={selectedSubCategory}
                            className="col-3 ps-1"
                            onChange={handleSubCategoryChange}
                            options={subCategoryOptions}
                        />
                        : <div className="d-flex col-3"></div>}

                    <DropdownController
                        label="Zone"
                        value={selectedZone}
                        className="col-3 px-1"
                        onChange={handleZoneChange}
                        options={zoneOptions}
                    />

                    {selectedZone !== "All"
                        ? <DropdownController
                            label="Region"
                            value={selectedRegion}
                            className="col-3 px-1"
                            onChange={handleRegionChange}
                            options={regionOptions}
                        />
                        : <div className="d-flex col-3"></div>}

                    {selectedRegion !== "All"
                        ? <DropdownController
                            label="District"
                            value={selectedDistrict}
                            className="col-3 px-1"
                            onChange={handleDistrictChange}
                            options={districtOptions}
                        />
                        : <div className="d-flex col-3"></div>}

                    <DropdownController
                        label="Issue Type"
                        value={selectedIssueType}
                        className="col-3 px-1"
                        onChange={handleIssueTypeChange}
                        options={issueTypeOptions}
                    />

                    <AssigneeFilterDropdown
                        value={selectedAssignee}
                        onChange={handleAssigneeChange}
                    />

                    <DropdownController
                        label={t("Date Parameter")}
                        value={selectedDateParam}
                        onChange={(value) => {
                            setSelectedDateParam(String(value));
                            setPage(1);
                        }}
                        options={dateParamOptions}
                        style={{ width: 240 }}
                    />

                    {/* DATE RANGE FILTER */}
                    <DateRangeFilter value={dateRange} onChange={setDateRange} />

                    {/* LEVEL CHIP FILTER   --->   Switch to DROPDOWN*/}
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

                    {/* MASTER CHIP TOGGLE FILTER */}
                    {showMasterFilterToggle && (
                        <Chip
                            label={t("Master")}
                            color={masterOnly ? "primary" : "default"}
                            variant={masterOnly ? "filled" : "outlined"}
                            onClick={() => { setMasterOnly(prev => !prev); setPage(1); }}
                            sx={{ mr: 1 }}
                        />
                    )}
                    {/* -------- FILTERS END --------- */}

                    {/* VIEW TOGGLE - TABLE | GRID */}
                    <div className="d-flex align-items-center ms-auto">
                        <Button variant="outlined" onClick={resetFilters} className="me-2">
                            {t("Reset Filters")}
                        </Button>
                        {showGridTableViewToggle && showTablePermission && showGridPermission && (
                            <div className="d-flex">
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
                </div>


                {(viewMode === "table" && showTablePermission) || (viewMode === "grid" && showGridPermission) ? (
                    <div className="d-flex justify-content-between align-items-center mb-2 w-100">
                        <div className="fw-semibold">{`${t("Total Tickets")}: ${filteredTicketCount}`}</div>
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
                            handleFeedback={handleFeedback}
                            zoneOptions={zoneOptions}
                            issueTypeOptions={issueTypeOptions}
                            selectedZone={selectedZone}
                            selectedRegion={selectedRegion}
                            selectedDistrict={selectedDistrict}
                            selectedIssueType={selectedIssueType}
                            selectedAssignee={selectedAssignee}
                            issueTypeFilterLabel={selectedIssueTypeLabel}
                        />
                        <PaginationControls
                            className="justify-content-between align-items-center mt-3 w-100"
                            page={page}
                            totalPages={totalPages}
                            onChange={(_, val) => setPage(val)}
                            pageSize={tablePageSize}
                            onPageSizeChange={(value) => setTablePageSize(value)}
                            displayPagePosition
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
                            displayPagePosition
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

            {/* MODAL - FEEDBACK */}
            {feedbackOpen && <FeedbackModal open={feedbackOpen} ticketId={selectedTicketIdForFeedback} onClose={handleFeedbackClose} feedbackStatus={selectedTicketFeedbackStatus} />}
        </div>
    );
};

export default TicketsList;
