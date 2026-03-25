import React from "react";
import { SelectChangeEvent } from "@mui/material";
import { useCategoryFilters } from "./useCategoryFilters";
import { MISReportRequestParams, SupportDashboardTimeRange, SupportDashboardTimeScale } from "../types/reports";
import { calculateDateRange, timeRangeOptions, timeScaleOptions } from "../utils/misReports";
import { getZones, getRegions, getDistricts } from "../services/LocationService";
import { getIssueTypes } from "../services/IssueTypeService";
import { getDivisions } from "../services/DivisionService";
import { getAllUsers } from "../services/UserService";

interface RegionOption {
    value: string;
    label: string;
    hrmsRegCode?: string;
}

const allOption = { value: "All", label: "All" };

const extractList = (response: any) => {
    const rawPayload = response?.data ?? response;
    const payload = rawPayload?.body ?? rawPayload;
    if (Array.isArray(payload?.data)) return payload.data;
    return Array.isArray(payload) ? payload : [];
};

export interface UseMisReportFiltersResult {
    requestParams: MISReportRequestParams;
    timeScale: SupportDashboardTimeScale;
    timeRange: SupportDashboardTimeRange;
    availableTimeRanges: { value: SupportDashboardTimeRange; label: string }[];
    activeDateRange: { from: string; to: string };
    selectedCategory: string;
    selectedSubCategory: string;
    selectedZone: string;
    selectedRegion: string;
    selectedDistrict: string;
    selectedIssueType: string;
    selectedDivision: string;
    selectedAssignee: string;
    categoryOptions: { value: string; label: string }[];
    subCategoryOptions: { value: string; label: string }[];
    zoneOptions: { value: string; label: string }[];
    regionOptions: RegionOption[];
    districtOptions: { value: string; label: string }[];
    issueTypeOptions: { value: string; label: string }[];
    divisionOptions: { value: string; label: string }[];
    assigneeOptions: { value: string; label: string }[];
    handleTimeScaleChange: (event: SelectChangeEvent<string>) => void;
    handleTimeRangeChange: (event: SelectChangeEvent<string>) => void;
    handleDateChange: (key: "from" | "to") => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleCategoryChange: (event: SelectChangeEvent<string>) => void;
    handleSubCategoryChange: (event: SelectChangeEvent<string>) => void;
    handleZoneChange: (event: SelectChangeEvent<string>) => void;
    handleRegionChange: (event: SelectChangeEvent<string>) => void;
    handleDistrictChange: (event: SelectChangeEvent<string>) => void;
    handleIssueTypeChange: (event: SelectChangeEvent<string>) => void;
    handleDivisionChange: (event: SelectChangeEvent<string>) => void;
    handleAssigneeChange: (event: SelectChangeEvent<string>) => void;
}

export const useMisReportFilters = (): UseMisReportFiltersResult => {
    const { categoryOptions, subCategoryOptions, loadSubCategories, resetSubCategories } = useCategoryFilters();

    const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
    const [selectedSubCategory, setSelectedSubCategory] = React.useState<string>("All");
    const [selectedZone, setSelectedZone] = React.useState<string>("All");
    const [selectedRegion, setSelectedRegion] = React.useState<string>("All");
    const [selectedDistrict, setSelectedDistrict] = React.useState<string>("All");
    const [selectedIssueType, setSelectedIssueType] = React.useState<string>("All");
    const [selectedDivision, setSelectedDivision] = React.useState<string>("All");
    const [selectedAssignee, setSelectedAssignee] = React.useState<string>("All");

    const [zoneOptions, setZoneOptions] = React.useState([{ ...allOption }]);
    const [regionOptions, setRegionOptions] = React.useState<RegionOption[]>([{ ...allOption }]);
    const [districtOptions, setDistrictOptions] = React.useState([{ ...allOption }]);
    const [issueTypeOptions, setIssueTypeOptions] = React.useState([{ ...allOption }]);
    const [divisionOptions, setDivisionOptions] = React.useState([{ ...allOption }]);
    const [assigneeOptions, setAssigneeOptions] = React.useState([{ ...allOption }]);

    const [timeScale, setTimeScale] = React.useState<SupportDashboardTimeScale>("DAILY");
    const [timeRange, setTimeRange] = React.useState<SupportDashboardTimeRange>("ALL_TIME");
    const [dateRange, setDateRange] = React.useState<{ from: string; to: string }>(() =>
        calculateDateRange("DAILY", "ALL_TIME", { start: null, end: null }),
    );
    const availableTimeRanges = React.useMemo(() => timeRangeOptions[timeScale] ?? [], [timeScale]);

    const activeDateRange = React.useMemo(() => {
        if (timeRange === "CUSTOM_DATE_RANGE") {
            return dateRange;
        }
        return calculateDateRange(timeScale, timeRange, { start: null, end: null });
    }, [dateRange, timeRange, timeScale]);

    const requestParams = React.useMemo<MISReportRequestParams>(() => {
        const categoryId = selectedCategory === "All" ? undefined : selectedCategory;
        const subCategoryId = categoryId && selectedSubCategory !== "All" ? selectedSubCategory : undefined;
        const zoneCode = selectedZone === "All" ? undefined : selectedZone;
        const regionCode = zoneCode && selectedRegion !== "All" ? selectedRegion : undefined;
        const districtCode = regionCode && selectedDistrict !== "All" ? selectedDistrict : undefined;
        const issueTypeId = selectedIssueType === "All" ? undefined : selectedIssueType;
        const divisionId = selectedDivision === "All" ? undefined : selectedDivision;
        const assignedTo = selectedAssignee === "All" ? undefined : selectedAssignee;

        return {
            fromDate: activeDateRange.from,
            toDate: activeDateRange.to,
            categoryId,
            subCategoryId,
            zoneCode,
            regionCode,
            districtCode,
            issueTypeId,
            divisionId,
            assignedTo,
        };
    }, [
        activeDateRange.from,
        activeDateRange.to,
        selectedCategory,
        selectedSubCategory,
        selectedZone,
        selectedRegion,
        selectedDistrict,
        selectedIssueType,
        selectedDivision,
        selectedAssignee,
    ]);

    const handleTimeScaleChange = (event: SelectChangeEvent<string>) => {
        const newScale = event.target.value as SupportDashboardTimeScale;
        setTimeScale(newScale);
        const defaultRange = timeRangeOptions[newScale]?.[0]?.value ?? "CUSTOM_DATE_RANGE";
        setTimeRange(defaultRange);
    };

    const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
        setTimeRange(event.target.value as SupportDashboardTimeRange);
    };

    const handleDateChange = (key: "from" | "to") => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setDateRange((previous) => {
            if (key === "from" && previous.to && value && value > previous.to) {
                return { from: value, to: value };
            }

            if (key === "to" && previous.from && value && value < previous.from) {
                return { from: value, to: value };
            }

            return { ...previous, [key]: value };
        });
        setTimeRange("CUSTOM_DATE_RANGE");
    };

    const handleCategoryChange = (event: SelectChangeEvent<string>) => setSelectedCategory(event.target.value as string);
    const handleSubCategoryChange = (event: SelectChangeEvent<string>) => setSelectedSubCategory(event.target.value as string);

    const handleZoneChange = (event: SelectChangeEvent<string>) => {
        setSelectedZone(event.target.value as string);
        setSelectedRegion("All");
        setSelectedDistrict("All");
    };
    const handleRegionChange = (event: SelectChangeEvent<string>) => {
        setSelectedRegion(event.target.value as string);
        setSelectedDistrict("All");
    };
    const handleDistrictChange = (event: SelectChangeEvent<string>) => setSelectedDistrict(event.target.value as string);
    const handleIssueTypeChange = (event: SelectChangeEvent<string>) => setSelectedIssueType(event.target.value as string);
    const handleDivisionChange = (event: SelectChangeEvent<string>) => setSelectedDivision(event.target.value as string);
    const handleAssigneeChange = (event: SelectChangeEvent<string>) => setSelectedAssignee(event.target.value as string);

    React.useEffect(() => {
        if (selectedCategory && selectedCategory !== "All") {
            loadSubCategories(selectedCategory);
            setSelectedSubCategory("All");
            return;
        }

        resetSubCategories();
        setSelectedSubCategory("All");
    }, [loadSubCategories, resetSubCategories, selectedCategory]);

    React.useEffect(() => {
        if (timeRange === "CUSTOM_DATE_RANGE") {
            return;
        }

        setDateRange(calculateDateRange(timeScale, timeRange, { start: null, end: null }));
    }, [timeRange, timeScale]);

    React.useEffect(() => {
        getZones()
            .then((response) => {
                const zones = extractList(response);
                setZoneOptions([
                    allOption,
                    ...zones.map((zone: any) => ({
                        label: zone.zoneName ? `${zone.zoneName} (${zone.zoneCode})` : String(zone.zoneCode ?? ""),
                        value: String(zone.zoneCode ?? ""),
                    })),
                ]);
            })
            .catch(() => setZoneOptions([{ ...allOption }]));

        getIssueTypes()
            .then((response) => {
                const issueTypes = extractList(response);
                setIssueTypeOptions([
                    allOption,
                    ...issueTypes.map((issueType: any) => ({
                        label: issueType.issueTypeLabel ?? "",
                        value: String(issueType.issueTypeId ?? ""),
                    })),
                ]);
            })
            .catch(() => setIssueTypeOptions([{ ...allOption }]));

        getDivisions()
            .then((response) => {
                const divisions = extractList(response);
                setDivisionOptions([
                    allOption,
                    ...divisions.map((division: any) => ({
                        label: division.divisionName ?? "",
                        value: String(division.divisionId ?? ""),
                    })),
                ]);
            })
            .catch(() => setDivisionOptions([{ ...allOption }]));

        getAllUsers()
            .then((response) => {
                const users = extractList(response);
                setAssigneeOptions([
                    allOption,
                    ...users.map((user: any) => ({
                        label: user.name ? `${user.name}${user.username ? ` (${user.username})` : ""}` : (user.username ?? ""),
                        value: String(user.userId ?? user.username ?? ""),
                    })).filter((user: { value: string }) => Boolean(user.value)),
                ]);
            })
            .catch(() => setAssigneeOptions([{ ...allOption }]));
    }, []);

    React.useEffect(() => {
        getRegions(selectedZone === "All" ? undefined : selectedZone)
            .then((response) => {
                const regions = extractList(response);
                setRegionOptions([
                    allOption,
                    ...regions.map((region: any) => ({
                        label: region.regionName ?? String(region.regionCode ?? ""),
                        value: String(region.regionCode ?? ""),
                        hrmsRegCode: region.hrmsRegCode ?? "",
                    })),
                ]);
            })
            .catch(() => setRegionOptions([{ ...allOption }]));
    }, [selectedZone]);

    React.useEffect(() => {
        const matchedRegion = regionOptions.find((region) => region.value === selectedRegion);
        const hrmsRegCode = matchedRegion?.hrmsRegCode;

        getDistricts(selectedRegion === "All" ? undefined : hrmsRegCode)
            .then((response) => {
                const districts = extractList(response);
                setDistrictOptions([
                    allOption,
                    ...districts.map((district: any) => ({
                        label: district.districtName
                            ? `${district.districtName} (${district.districtCode})`
                            : String(district.districtCode ?? ""),
                        value: String(district.districtCode ?? ""),
                    })),
                ]);
            })
            .catch(() => setDistrictOptions([{ ...allOption }]));
    }, [regionOptions, selectedRegion]);

    return {
        requestParams,
        timeScale,
        timeRange,
        availableTimeRanges,
        activeDateRange,
        selectedCategory,
        selectedSubCategory,
        selectedZone,
        selectedRegion,
        selectedDistrict,
        selectedIssueType,
        selectedDivision,
        selectedAssignee,
        categoryOptions,
        subCategoryOptions,
        zoneOptions,
        regionOptions,
        districtOptions,
        issueTypeOptions,
        divisionOptions,
        assigneeOptions,
        handleTimeScaleChange,
        handleTimeRangeChange,
        handleDateChange,
        handleCategoryChange,
        handleSubCategoryChange,
        handleZoneChange,
        handleRegionChange,
        handleDistrictChange,
        handleIssueTypeChange,
        handleDivisionChange,
        handleAssigneeChange,
    };
};

export { timeScaleOptions, timeRangeOptions } from "../utils/misReports";
