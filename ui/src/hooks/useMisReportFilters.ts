import React from "react";
import { SelectChangeEvent } from "@mui/material";
import { getCurrentUserDetails } from "../config/config";
import { useCategoryFilters } from "./useCategoryFilters";
import { MISReportRequestParams, SupportDashboardTimeRange, SupportDashboardTimeScale } from "../types/reports";
import { ADMIN_ROLES, calculateDateRange, timeRangeOptions, timeScaleOptions } from "../utils/misReports";

export interface UseMisReportFiltersResult {
    requestParams: MISReportRequestParams;
    timeScale: SupportDashboardTimeScale;
    timeRange: SupportDashboardTimeRange;
    availableTimeRanges: { value: SupportDashboardTimeRange; label: string }[];
    activeDateRange: { from: string; to: string };
    customMonthRange: { start: number | null; end: number | null };
    selectedCategory: string;
    selectedSubCategory: string;
    categoryOptions: { value: string; label: string }[];
    subCategoryOptions: { value: string; label: string }[];
    viewScope: MISReportRequestParams["scope"];
    handleTimeScaleChange: (event: SelectChangeEvent<string>) => void;
    handleTimeRangeChange: (event: SelectChangeEvent<string>) => void;
    handleCustomMonthRangeChange: (key: "start" | "end") => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (key: "from" | "to") => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleCategoryChange: (event: SelectChangeEvent<string>) => void;
    handleSubCategoryChange: (event: SelectChangeEvent<string>) => void;
}

export const useMisReportFilters = (): UseMisReportFiltersResult => {
    const userDetails = React.useMemo(() => getCurrentUserDetails(), []);
    const { categoryOptions, subCategoryOptions, loadSubCategories, resetSubCategories } = useCategoryFilters();
    const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
    const [selectedSubCategory, setSelectedSubCategory] = React.useState<string>("All");
    const [timeScale, setTimeScale] = React.useState<SupportDashboardTimeScale>("DAILY");
    const [timeRange, setTimeRange] = React.useState<SupportDashboardTimeRange>("LAST_30_DAYS");
    const [customMonthRange, setCustomMonthRange] = React.useState<{ start: number | null; end: number | null }>(() => ({
        start: null,
        end: null,
    }));
    const [dateRange, setDateRange] = React.useState<{ from: string; to: string }>(() =>
        calculateDateRange("DAILY", "LAST_30_DAYS", { start: null, end: null }),
    );
    const availableTimeRanges = React.useMemo(() => timeRangeOptions[timeScale] ?? [], [timeScale]);

    const viewScope: MISReportRequestParams["scope"] = React.useMemo(() => {
        const roles = userDetails?.role ?? [];
        return roles.some((role) => ADMIN_ROLES.has(role)) ? "all" : "user";
    }, [userDetails?.role]);

    const activeDateRange = React.useMemo(() => {
        if (timeScale === "CUSTOM" || timeRange === "CUSTOM_DATE_RANGE") {
            return dateRange;
        }

        return calculateDateRange(timeScale, timeRange, customMonthRange);
    }, [customMonthRange, dateRange, timeRange, timeScale]);

    const requestParams = React.useMemo<MISReportRequestParams>(() => {
        const categoryId = selectedCategory === "All" ? undefined : selectedCategory;
        const subCategoryId = categoryId && selectedSubCategory !== "All" ? selectedSubCategory : undefined;

        return {
            fromDate: activeDateRange.from,
            toDate: activeDateRange.to,
            scope: viewScope,
            userId: userDetails?.userId,
            categoryId,
            subCategoryId,
        };
    }, [activeDateRange.from, activeDateRange.to, selectedCategory, selectedSubCategory, userDetails?.userId, viewScope]);

    const handleTimeScaleChange = (event: SelectChangeEvent<string>) => {
        const newScale = event.target.value as SupportDashboardTimeScale;
        setTimeScale(newScale);
        const defaultRange = timeRangeOptions[newScale]?.[0]?.value ?? "CUSTOM_DATE_RANGE";
        setTimeRange(defaultRange);
    };

    const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
        setTimeRange(event.target.value as SupportDashboardTimeRange);
    };

    const handleCustomMonthRangeChange = (key: "start" | "end") =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value ? Number(event.target.value) : null;
            setCustomMonthRange((previous) => ({ ...previous, [key]: value }));
            setTimeScale("MONTHLY");
            setTimeRange("CUSTOM_MONTH_RANGE");
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
        setTimeScale("CUSTOM");
        setTimeRange("CUSTOM_DATE_RANGE");
    };

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        setSelectedCategory(event.target.value as string);
    };

    const handleSubCategoryChange = (event: SelectChangeEvent<string>) => {
        setSelectedSubCategory(event.target.value as string);
    };

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
        if (timeScale === "CUSTOM" || timeRange === "CUSTOM_DATE_RANGE") {
            return;
        }

        setDateRange(calculateDateRange(timeScale, timeRange, customMonthRange));
    }, [customMonthRange, timeRange, timeScale]);

    return {
        requestParams,
        timeScale,
        timeRange,
        availableTimeRanges,
        activeDateRange,
        customMonthRange,
        selectedCategory,
        selectedSubCategory,
        categoryOptions,
        subCategoryOptions,
        viewScope,
        handleTimeScaleChange,
        handleTimeRangeChange,
        handleCustomMonthRangeChange,
        handleDateChange,
        handleCategoryChange,
        handleSubCategoryChange,
    };
};

export { timeScaleOptions, timeRangeOptions } from "../utils/misReports";
