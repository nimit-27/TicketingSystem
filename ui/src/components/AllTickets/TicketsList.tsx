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
import { getDivisions } from "../../services/DivisionService";
import { getDropdownOptions } from "../../utils/Utils";

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
    selectedDivision: string;
    selectedDateParam: string;
    breachOption: string;
    breachInHours: number;
    breachInMinutes: number;
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
    divisionId?: string;
    breachOption?: string;
    breachInMinutes?: number;
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
    const { data: divisionsResponse = [], apiHandler: getDivisionsApiHandler } = useApi<any[]>();

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
    const normalizedOfficeType = String(userDetails?.officeType ?? "").trim().toUpperCase();

    const defaultZoneCode = userDetails?.zoneCode ? String(userDetails.zoneCode) : "All";
    const defaultRegionCode = userDetails?.regionCode
        ? String(userDetails.regionCode)
        : normalizedOfficeType === "RO" && userDetails?.officeCode
            ? String(userDetails.officeCode)
            : "All";
    const defaultDistrictCode = userDetails?.districtCode
        ? String(userDetails.districtCode)
        : normalizedOfficeType === "DO" && userDetails?.officeCode
            ? String(userDetails.officeCode)
            : "All";
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
    const [selectedRegion, setSelectedRegion] = useState<string>(defaultRegionCode);
    const [selectedRegionHrmsCode, setSelectedRegionHrmsCode] = useState<string>("All");
    const [selectedDistrict, setSelectedDistrict] = useState<string>(defaultDistrictCode);
    const [selectedIssueType, setSelectedIssueType] = useState<string>("All");
    const [selectedDivision, setSelectedDivision] = useState<string>("All");
    const [selectedAssignee, setSelectedAssignee] = useState<string>("All");
    const [breachOption, setBreachOption] = useState<string>("All");
    const [breachInHours, setBreachInHours] = useState<number>(0);
    const [breachInMinutes, setBreachInMinutes] = useState<number>(0);

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

    const issueTypeOptions: DropdownOption[] = useMemo(() => {
        const allIssueTypes = ((issueTypesResponse as any)?.data ?? issueTypesResponse ?? []) as any[];
        const shouldRestrictToSlaEnabled = breachOption === "BREACHED" || breachOption === "BREACH_IN";
        const filteredIssueTypes = shouldRestrictToSlaEnabled
            ? allIssueTypes.filter((issueType: any) => issueType?.slaFlag === true || issueType?.slaFlag === 1 || issueType?.slaFlag === "1")
            : allIssueTypes;

        return [
            { label: "All", value: "All" },
            ...filteredIssueTypes.map((issueType: any) => ({
                label: issueType.issueTypeLabel ?? "",
                value: String(issueType.issueTypeId ?? ""),
            })),
        ];
    },
        [breachOption, issueTypesResponse],
    );

    const divisionOptions: DropdownOption[] = useMemo(
        () => [{ label: "All", value: "All" }, ...getDropdownOptions((divisionsResponse as any)?.data ?? divisionsResponse ?? [], "divisionName", "divisionId")],
        [divisionsResponse],
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
        setSelectedRegion(defaultRegionCode);
        setSelectedRegionHrmsCode("All");
        setSelectedDistrict(defaultDistrictCode);
        setSelectedIssueType("All");
        setSelectedDivision("All");
        setSelectedAssignee("All");
        setBreachOption("All");
        setBreachInHours(0);
        setBreachInMinutes(0);
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
    const normalizedDivision = selectedDivision !== "All" ? selectedDivision : undefined;
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
            selectedDivision,
            selectedDateParam,
            breachOption,
            breachInHours,
            breachInMinutes,
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
            selectedDivision,
            selectedDateParam,
            breachOption,
            breachInHours,
            breachInMinutes,
        ],
    );

    const callSearch = useCallback(
        (
            overrides?: TicketsListSearchOverrides,
            options?: { pageOverride?: number; sizeOverride?: number }
        ) => {
            const effectivePage = options?.pageOverride ?? page;
            const effectiveSize = options?.sizeOverride ?? pageSize;

            if (!allowAll) {
                if (!allowedStatusSuccess) return
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
            const divisionParam = mergedOverrides.divisionId ?? normalizedDivision;
            const breachOptionParam = mergedOverrides.breachOption ?? (breachOption === "All" ? undefined : breachOption);
            const computedBreachInMinutes = Math.max(0, (breachInHours * 60) + breachInMinutes);
            const breachInMinutesParam = mergedOverrides.breachInMinutes ?? (
                breachOptionParam === "BREACH_IN" && computedBreachInMinutes > 0
                    ? computedBreachInMinutes
                    : undefined
            );

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
                    divisionParam,
                    breachOptionParam,
                    breachInMinutesParam,
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
            normalizedDivision,
            normalizedAssignee,
            breachOption,
            breachInHours,
            breachInMinutes,
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

    const handleDivisionChange = (value: string) => {
        setSelectedDivision(value);
        setPage(1);
    };

    const handleBreachOptionChange = (value: string) => {
        setBreachOption(value);
        if (value !== "BREACH_IN") {
            setBreachInHours(0);
            setBreachInMinutes(0);
        }
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
        getDivisionsApiHandler(() => getDivisions());
        if (restrictStatusesToAllowed) {
            allowedStatusApiHandler(() => getAllowedStatusListByRoles(roles));
        } else {
            getStatuses().then(setStatusList);
        }
    }, [allowedStatusApiHandler, getDivisionsApiHandler, getIssueTypesApiHandler, getZonesApiHandler, restrictStatusesToAllowed, workflowApiHandler]);

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

        const shouldAutoSelectRegion = selectedZone === defaultZoneCode && defaultRegionCode !== "All";

        setSelectedRegion(shouldAutoSelectRegion ? defaultRegionCode : "All");
        setSelectedRegionHrmsCode("All");
        setSelectedDistrict(shouldAutoSelectRegion && defaultDistrictCode !== "All" ? defaultDistrictCode : "All");
        getRegionsApiHandler(() => getRegions(selectedZone));
    }, [defaultDistrictCode, defaultRegionCode, defaultZoneCode, getRegionsApiHandler, selectedZone]);

    useEffect(() => {
        if (selectedRegionHrmsCode === "All") {
            if (selectedRegion === "All") {
                setSelectedDistrict("All");
            }
            return;
        }

        const shouldAutoSelectDistrict = selectedRegion === defaultRegionCode && defaultDistrictCode !== "All";
        setSelectedDistrict(shouldAutoSelectDistrict ? defaultDistrictCode : "All");
        getDistrictsApiHandler(() => getDistricts(selectedRegionHrmsCode));
    }, [defaultDistrictCode, defaultRegionCode, getDistrictsApiHandler, selectedRegion, selectedRegionHrmsCode]);

    useEffect(() => {
        if (selectedRegion === "All") {
            setSelectedRegionHrmsCode("All");
            return;
        }

        const matchingOption = (regionOptions as Array<{ value: string; hrmsRegCode?: string }>).find((option) => option.value === selectedRegion);
        setSelectedRegionHrmsCode(matchingOption?.hrmsRegCode ? String(matchingOption.hrmsRegCode) : selectedRegion);
    }, [regionOptions, selectedRegion]);

    useEffect(() => {
        if (workflowData) {
            setWorkflowMap(workflowData);
        }
    }, [workflowData]);

    useEffect(() => {
        if (selectedIssueType === "All") {
            return;
        }

        const existsInOptions = issueTypeOptions.some((option) => option.value === selectedIssueType);
        if (!existsInOptions) {
            setSelectedIssueType("All");
            setPage(1);
        }
    }, [issueTypeOptions, selectedIssueType]);

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
        selectedDivision,
        selectedAssignee,
        breachOption,
        breachInHours,
        breachInMinutes,
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
                <div className="row align-items-center mb-3 g-2">
                    {/* -------- FILTERS --------- */}

                    {/* SEARCH FILTER */}
                    {showSearchBar && (
                        <div className="col-3">
                            <GenericInput
                                className="w-100"
                                label="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Ticket Id, Requestor Name, Subject"
                            />
                        </div>
                    )}

                    {/* STATUS FILTER */}
                    {showStatusFilter && (
                        <div className="col-3">
                            <DropdownController
                                className="w-100"
                                label="Status"
                                value={statusFilter}
                                onChange={(value) => {
                                    setStatusFilter(value);
                                    setPage(1);
                                }}
                                options={statusFilterOptions}
                            />
                        </div>
                    )}

                    {/* CATEGORY */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Module"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                        />
                    </div>

                    {/* SUB CATEGORY */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Sub Module"
                            value={selectedSubCategory}
                            onChange={handleSubCategoryChange}
                            options={subCategoryOptions}
                            disabled={selectedCategory === "All"}
                        />
                    </div>

                    {/* ZONE */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Zone"
                            value={selectedZone}
                            onChange={handleZoneChange}
                            options={zoneOptions}
                        />
                    </div>

                    {/* REGION */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Region"
                            value={selectedRegion}
                            onChange={handleRegionChange}
                            options={regionOptions}
                            disabled={selectedZone === "All"}
                        />
                    </div>

                    {/* DISTRICT */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="District"
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            options={districtOptions}
                            disabled={selectedRegion === "All"}
                        />
                    </div>

                    {/* ISSUE TYPE */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Issue Type"
                            value={selectedIssueType}
                            onChange={handleIssueTypeChange}
                            options={issueTypeOptions}
                        />
                    </div>

                    {/* DIVISION */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Division"
                            value={selectedDivision}
                            onChange={handleDivisionChange}
                            options={divisionOptions}
                        />
                    </div>

                    {/* ASSIGNEE */}
                    <div className="col-3">
                        <AssigneeFilterDropdown
                            className="w-100"
                            value={selectedAssignee}
                            onChange={handleAssigneeChange}
                        />
                    </div>

                    {/* BREACH OPTION */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label="Breach Option"
                            value={breachOption}
                            onChange={handleBreachOptionChange}
                            options={[
                                { label: "All", value: "All" },
                                { label: "Breached", value: "BREACHED" },
                                { label: "Breach In", value: "BREACH_IN" },
                            ]}
                        />
                    </div>

                    {/* BREACH IN */}
                    {breachOption === "BREACH_IN" && (
                        <>
                            <div className="col-3">
                                <GenericInput
                                    className="w-100"
                                    label="Breach In (Hours)"
                                    type="number"
                                    value={String(breachInHours)}
                                    onChange={(e) => {
                                        const v = Math.max(0, Math.floor(Number(e.target.value) || 0));
                                        setBreachInHours(v);
                                        setPage(1);
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            <div className="col-3">
                                <GenericInput
                                    className="w-100"
                                    label="Breach In (Minutes)"
                                    type="number"
                                    value={String(breachInMinutes)}
                                    onChange={(e) => {
                                        const v = Math.min(59, Math.max(0, Math.floor(Number(e.target.value) || 0)));
                                        setBreachInMinutes(v);
                                        setPage(1);
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </>
                    )}

                    {/* DATE PARAMETER */}
                    <div className="col-3">
                        <DropdownController
                            className="w-100"
                            label={t("Date Parameter")}
                            value={selectedDateParam}
                            onChange={(value) => {
                                setSelectedDateParam(String(value));
                                setPage(1);
                            }}
                            options={dateParamOptions}
                        />
                    </div>

                    {/* DATE RANGE */}
                    <div className="col-3">
                        <DateRangeFilter
                            className="w-100"
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </div>

                    {/* LEVEL FILTER */}
                    {showLevelFilterToggle &&
                        levels.map((level) => (
                            <div key={level} className="col-auto">
                                <Chip
                                    label={level}
                                    color={levelFilter === level ? "primary" : "default"}
                                    variant={levelFilter === level ? "filled" : "outlined"}
                                    onClick={() => {
                                        setLevelFilter((prev) => (prev === level ? undefined : level));
                                        setPage(1);
                                    }}
                                />
                            </div>
                        ))}

                    {/* MASTER FILTER */}
                    {showMasterFilterToggle && (
                        <div className="col-auto">
                            <Chip
                                label={t("Master")}
                                color={masterOnly ? "primary" : "default"}
                                variant={masterOnly ? "filled" : "outlined"}
                                onClick={() => {
                                    setMasterOnly((prev) => !prev);
                                    setPage(1);
                                }}
                            />
                        </div>
                    )}

                    {/* VIEW TOGGLE */}
                    <div className="d-flex align-items-center ms-auto">
                        <Button variant="outlined" onClick={resetFilters} className="me-2">
                            {t("Reset Filters")}
                        </Button>

                        {showGridTableViewToggle && showTablePermission && showGridPermission && (
                            <ViewToggle
                                value={viewMode}
                                onChange={(value: any) => setViewMode(value)}
                                options={[
                                    { icon: "grid", value: "grid" },
                                    { icon: "table", value: "table" },
                                ]}
                            />
                        )}
                    </div>

                    {/* -------- FILTERS END --------- */}
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
                            selectedDivision={selectedDivision}
                            selectedCategory={selectedCategory}
                            selectedSubCategory={selectedSubCategory}
                            selectedAssignee={selectedAssignee}
                            divisionOptions={divisionOptions}
                            statusFilterOptions={statusFilterOptions}
                            selectedStatusFilter={statusFilter}
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
