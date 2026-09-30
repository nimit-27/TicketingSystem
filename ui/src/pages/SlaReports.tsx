import React from "react";
import { Box, TextField } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import SlaReportGenerator from "../components/MISReports/SlaReportGenerator";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import SlaPerformanceReport from "../components/MISReports/SlaPerformanceReport";
import { timeScaleOptions } from "../utils/misReports";
import { useMisReportFilters } from "../hooks/useMisReportFilters";
import { useApi } from "../hooks/useApi";
import { getZones, getRegions, getDistricts } from "../services/LocationService";
import { getIssueTypes } from "../services/IssueTypeService";
import { getDivisions } from "../services/DivisionService";
import { getDropdownOptionsWithExtraOption } from "../utils/Utils";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { checkAccessMaster } from "../utils/permissions";
import { downloadTicketsReport, getSlaReportDefaultDates } from "../services/TicketService";
import { getCurrentUserDetails } from "../config/config";
import { useSnackbar } from "../context/SnackbarContext";
import { createMonthOptions, createQuarterOptions, DetailedSlaInterval, getPeriodDateRange } from "../utils/detailedSlaReportDates";

const getCurrentDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const SlaReports: React.FC = () => {
    const navigate = useNavigate();
    const { showMessage } = useSnackbar();
    const hasAccess = React.useCallback((keys: string[]) => checkAccessMaster(["slaReports", ...keys]), []);
    const allOption: DropdownOption = React.useMemo(() => ({ label: "All", value: "All" }), []);
    const {
        requestParams,
        timeScale,
        timeRange,
        availableTimeRanges,
        activeDateRange,
        selectedCategory,
        selectedSubCategory,
        categoryOptions,
        subCategoryOptions,
        handleTimeScaleChange,
        handleTimeRangeChange,
        handleDateChange,
        handleCategoryChange,
        handleSubCategoryChange,
    } = useMisReportFilters({
        initialTimeScale: "MONTHLY",
        initialTimeRange: "ALL_TIME",
        allowedTimeScales: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    });

    const [selectedZone, setSelectedZone] = React.useState("All");
    const [selectedRegion, setSelectedRegion] = React.useState("All");
    const [selectedDistrict, setSelectedDistrict] = React.useState("All");
    const [selectedIssueType, setSelectedIssueType] = React.useState("All");
    const [selectedDivision, setSelectedDivision] = React.useState("All");
    const [selectedBreached, setSelectedBreached] = React.useState<"ALL" | "BREACHED" | "BREACHED_IN">("ALL");
    const [reportDownloading, setReportDownloading] = React.useState(false);
    const [detailedReportDownloading, setDetailedReportDownloading] = React.useState(false);
    const [reportDates, setReportDates] = React.useState({
        fromDate: "",
        toDate: getCurrentDate(),
    });
    const [detailedReportFilters, setDetailedReportFilters] = React.useState<{
        fromDate: string;
        toDate: string;
        interval: DetailedSlaInterval;
        fromPeriod: string;
        toPeriod: string;
    }>({
        fromDate: "",
        toDate: getCurrentDate(),
        interval: "MONTHLY",
        fromPeriod: "",
        toPeriod: "",
    });
    const monthOptions = React.useMemo(() => createMonthOptions(), []);
    const quarterOptions = React.useMemo(() => createQuarterOptions(), []);
    const [regionOptions, setRegionOptions] = React.useState<DropdownOption[]>([allOption]);
    const [districtOptions, setDistrictOptions] = React.useState<DropdownOption[]>([allOption]);

    const { data: zonesData = [], apiHandler: zonesHandler } = useApi<any[]>();
    const { data: regionsData = [], apiHandler: regionsHandler } = useApi<any[]>();
    const { data: districtsData = [], apiHandler: districtsHandler } = useApi<any[]>();
    const { data: issueTypesData = [], apiHandler: issueTypesHandler } = useApi<any[]>();
    const { data: divisionsData = [], apiHandler: divisionsHandler } = useApi<any[]>();

    React.useEffect(() => {
        void zonesHandler(() => getZones());
        void issueTypesHandler(() => getIssueTypes());
        void divisionsHandler(() => getDivisions());
    }, [divisionsHandler, issueTypesHandler, zonesHandler]);

    React.useEffect(() => {
        void getSlaReportDefaultDates()
            .then(({ data }) => {
                const dates = { fromDate: data.fromDate, toDate: data.toDate || getCurrentDate() };
                setReportDates(dates);
                setDetailedReportFilters((current) => ({ ...current, ...dates }));
            })
            .catch(() => {
                // The API also applies these defaults when a report is generated.
            });
    }, []);

    React.useEffect(() => {
        if (!selectedZone || selectedZone === "All") {
            setRegionOptions([allOption]);
            setSelectedRegion("All");
            setDistrictOptions([allOption]);
            setSelectedDistrict("All");
            return;
        }
        void regionsHandler(() => getRegions(selectedZone));
    }, [allOption, regionsHandler, selectedZone]);

    React.useEffect(() => {
        if (!selectedRegion || selectedRegion === "All") {
            setDistrictOptions([allOption]);
            setSelectedDistrict("All");
            return;
        }
        void districtsHandler(() => getDistricts(`${selectedRegion}11`));
    }, [allOption, districtsHandler, selectedRegion]);

    React.useEffect(() => {
        const normalized = Array.isArray(regionsData) ? regionsData : (regionsData as any)?.data ?? [];
        setRegionOptions(getDropdownOptionsWithExtraOption(normalized, "regionName", "regionCode", allOption));
    }, [allOption, regionsData]);

    React.useEffect(() => {
        const normalized = Array.isArray(districtsData) ? districtsData : (districtsData as any)?.data ?? [];
        setDistrictOptions(getDropdownOptionsWithExtraOption(normalized, "districtName", "districtCode", allOption));
    }, [allOption, districtsData]);

    const zoneOptions = React.useMemo(() => {
        const normalized = Array.isArray(zonesData) ? zonesData : (zonesData as any)?.data ?? [];
        return getDropdownOptionsWithExtraOption(normalized, "zoneName", "zoneCode", allOption);
    }, [allOption, zonesData]);

    const issueTypeOptions = React.useMemo(() => {
        const normalized = Array.isArray(issueTypesData) ? issueTypesData : (issueTypesData as any)?.data ?? [];
        const filteredIssueTypes = (selectedBreached === "BREACHED" || selectedBreached === "BREACHED_IN")
            ? normalized.filter((item: any) => Boolean(item?.slaFlag))
            : normalized;
        const mapped = filteredIssueTypes
            .map((item: any) => ({
                value: item?.issueTypeId,
                label: item?.issueTypeLabel ?? item?.name ?? item?.issueType ?? item?.issueTypeId,
            }))
            .filter((item: any) => Boolean(item.value) && Boolean(item.label));
        return [allOption, ...mapped];
    }, [allOption, issueTypesData, selectedBreached]);

    const divisionOptions = React.useMemo(() => {
        const normalized = Array.isArray(divisionsData) ? divisionsData : (divisionsData as any)?.data ?? [];
        return getDropdownOptionsWithExtraOption(normalized, "divisionName", "divisionId", allOption);
    }, [allOption, divisionsData]);

    const breachedOptions = React.useMemo(
        () => [
            { value: "ALL", label: "All" },
            { value: "BREACHED", label: "Breached" },
            { value: "BREACHED_IN", label: "Breached In-Progress" },
        ],
        [],
    );

    React.useEffect(() => {
        if (selectedIssueType === "All") {
            return;
        }
        const available = issueTypeOptions.some((option) => option.value === selectedIssueType);
        if (!available) {
            setSelectedIssueType("All");
        }
    }, [issueTypeOptions, selectedIssueType]);

    const extendedRequestParams = React.useMemo(
        () => ({
            ...requestParams,
            scope: undefined,
            userId: undefined,
            zoneCode: selectedZone !== "All" ? selectedZone : undefined,
            regionCode: selectedRegion !== "All" ? selectedRegion : undefined,
            districtCode: selectedDistrict !== "All" ? selectedDistrict : undefined,
            issueTypeId: selectedIssueType !== "All" ? selectedIssueType : undefined,
            division: selectedDivision !== "All" ? selectedDivision : undefined,
            breachedFilter: selectedBreached,
        }),
        [requestParams, selectedBreached, selectedDistrict, selectedDivision, selectedIssueType, selectedRegion, selectedZone],
    );

    const showReportGenerator = React.useMemo(() => hasAccess(["reportGenerator"]), [hasAccess]);
    const showIntervalFilter = React.useMemo(() => hasAccess(["filters", "interval"]), [hasAccess]);
    const showRangeFilter = React.useMemo(() => hasAccess(["filters", "range"]), [hasAccess]);
    const showFromDateFilter = React.useMemo(() => hasAccess(["filters", "fromDate"]), [hasAccess]);
    const showToDateFilter = React.useMemo(() => hasAccess(["filters", "toDate"]), [hasAccess]);
    const showModuleFilter = React.useMemo(() => hasAccess(["filters", "module"]), [hasAccess]);
    const showSubModuleFilter = React.useMemo(() => hasAccess(["filters", "subModule"]), [hasAccess]);
    const showZoneFilter = React.useMemo(() => hasAccess(["filters", "zone"]), [hasAccess]);
    const showRegionFilter = React.useMemo(() => hasAccess(["filters", "region"]), [hasAccess]);
    const showDistrictFilter = React.useMemo(() => hasAccess(["filters", "district"]), [hasAccess]);
    const showIssueTypeFilter = React.useMemo(() => hasAccess(["filters", "issueType"]), [hasAccess]);
    const showDivisionFilter = React.useMemo(() => hasAccess(["filters", "division"]), [hasAccess]);
    const showBreachedFilter = React.useMemo(() => hasAccess(["filters", "breached"]), [hasAccess]);
    const showSlaPerformanceReport = React.useMemo(() => hasAccess(["slaPerformanceReport"]), [hasAccess]);

    const updateReportDate = (key: keyof typeof reportDates) => (event: React.ChangeEvent<HTMLInputElement>) =>
        setReportDates((current) => ({ ...current, [key]: event.target.value }));

    const updateDetailedReportFilter = (key: "fromDate" | "toDate") =>
        (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) =>
            setDetailedReportFilters((current) => ({ ...current, [key]: event.target.value }));

    const updateDetailedReportInterval = (event: SelectChangeEvent) =>
        setDetailedReportFilters((current) => ({
            ...current,
            interval: event.target.value as DetailedSlaInterval,
            fromPeriod: "",
            toPeriod: "",
        }));

    const updateDetailedReportPeriod = (key: "fromPeriod" | "toPeriod") => (event: SelectChangeEvent) => {
        const value = event.target.value;
        setDetailedReportFilters((current) => {
            const next = { ...current, [key]: value };
            if (!next.fromPeriod) return next;
            return { ...next, ...getPeriodDateRange(current.interval as "MONTHLY" | "QUARTERLY", next.fromPeriod, next.toPeriod) };
        });
    };

    const generateSlaReport = async (option: string) => {
        if (reportDates.fromDate && reportDates.toDate && reportDates.fromDate > reportDates.toDate) {
            showMessage("From date cannot be after to date.", "warning");
            return;
        }

        setReportDownloading(true);
        try {
            await downloadTicketsReport({
                reportCode: "SLA_SUMMARY_RPT_2",
                format: option === "pdf" ? "PDF" : "EXCEL",
                ...reportDates,
                requestedBy: getCurrentUserDetails()?.userId,
            });
            showMessage("SLA report request queued. Track it on the Downloads page.", "success");
            navigate("/downloads");
        } catch (error) {
            showMessage("Unable to queue the SLA report.", "error");
        } finally {
            setReportDownloading(false);
        }
    };

    const generateDetailedSlaReport = async (option: string) => {
        if (!detailedReportFilters.fromDate || !detailedReportFilters.toDate) {
            showMessage("From date and to date are required.", "warning");
            return;
        }
        if (detailedReportFilters.fromDate > detailedReportFilters.toDate) {
            showMessage("From date cannot be after to date.", "warning");
            return;
        }

        setDetailedReportDownloading(true);
        try {
            await downloadTicketsReport({
                reportCode: "SLA_DETAILED_RPT",
                format: option === "pdf" ? "PDF" : "EXCEL",
                ...detailedReportFilters,
                fromPeriod: undefined,
                toPeriod: undefined,
                requestedBy: getCurrentUserDetails()?.userId,
            });
            showMessage("Detailed SLA report request queued. Track it on the Downloads page.", "success");
        } catch (error) {
            showMessage("Unable to queue the detailed SLA report.", "error");
        } finally {
            setDetailedReportDownloading(false);
        }
    };

    const slaReportGeneratorComponent = (
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
          <SlaReportGenerator
            onDownload={generateSlaReport}
            busy={reportDownloading}
            filterControls={(
                <Box className="row g-2">
                    <Box className="col-12 col-md-6">
                        <TextField id="sla-report-modal-from" label="From Date" type="date" value={reportDates.fromDate} onChange={updateReportDate("fromDate")} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                    </Box>
                    <Box className="col-12 col-md-6">
                        <TextField id="sla-report-modal-to" label="To Date" type="date" value={reportDates.toDate} onChange={updateReportDate("toDate")} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                    </Box>
                </Box>
            )}
          />
          <SlaReportGenerator
            buttonLabel="Generate Detailed SLA Report"
            dialogTitle="Generate Detailed SLA Report"
            onDownload={generateDetailedSlaReport}
            onViewDownloads={() => navigate("/downloads")}
            busy={detailedReportDownloading}
            filterControls={(
                <Box className="row g-2">
                    <Box className="col-12">
                        <GenericDropdown
                            id="detailed-sla-report-interval"
                            label="Interval"
                            value={detailedReportFilters.interval}
                            onChange={updateDetailedReportInterval}
                            options={[{ value: "DAILY", label: "Daily" }, { value: "MONTHLY", label: "Monthly" }, { value: "QUARTERLY", label: "Quarterly" }]}
                            fullWidth
                        />
                    </Box>
                    {detailedReportFilters.interval !== "DAILY" && <>
                        <Box className="col-12 col-md-6">
                            <GenericDropdown
                                id="detailed-sla-report-from-period"
                                label={detailedReportFilters.interval === "MONTHLY" ? "From Month" : "From Quarter"}
                                value={detailedReportFilters.fromPeriod}
                                onChange={updateDetailedReportPeriod("fromPeriod")}
                                options={detailedReportFilters.interval === "MONTHLY" ? monthOptions : quarterOptions}
                                fullWidth
                            />
                        </Box>
                        <Box className="col-12 col-md-6">
                            <GenericDropdown
                                id="detailed-sla-report-to-period"
                                label={detailedReportFilters.interval === "MONTHLY" ? "To Month" : "To Quarter"}
                                value={detailedReportFilters.toPeriod}
                                onChange={updateDetailedReportPeriod("toPeriod")}
                                options={detailedReportFilters.interval === "MONTHLY" ? monthOptions : quarterOptions}
                                fullWidth
                                disabled={!detailedReportFilters.fromPeriod}
                            />
                        </Box>
                    </>}
                    <Box className="col-12 col-md-6">
                        <TextField id="detailed-sla-report-from" label="From Date" type="date" required value={detailedReportFilters.fromDate} onChange={updateDetailedReportFilter("fromDate")} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                    </Box>
                    <Box className="col-12 col-md-6">
                        <TextField id="detailed-sla-report-to" label="To Date" type="date" required value={detailedReportFilters.toDate} onChange={updateDetailedReportFilter("toDate")} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                    </Box>
                </Box>
            )}
          />
        </Box>
    );

    return (
        <div className="d-flex flex-column flex-grow-1 w-100">
            <Title textKey="SLA Reports" rightContent={showReportGenerator ? slaReportGeneratorComponent : undefined} />

            <Box display="flex" flexDirection="column" gap={2}>
                <Box className="row g-3" alignItems="stretch">
                    {showIntervalFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                        <GenericDropdown
                            id="sla-report-interval"
                            label="Interval"
                            value={timeScale}
                            onChange={handleTimeScaleChange}
                            options={timeScaleOptions.filter((option) => option.value !== "CUSTOM")}
                            fullWidth
                            className="w-100"
                        />
                    </Box>}
                    {showRangeFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                        <GenericDropdown
                            id="sla-report-range"
                            label="Range"
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            options={availableTimeRanges}
                            fullWidth
                            className="w-100"
                        />
                    </Box>}
                    {showFromDateFilter && <Box className="col-12 col-md-6 col-lg-3">
                        <TextField
                            id="sla-report-from"
                            label="From Date"
                            type="date"
                            value={activeDateRange.from}
                            onChange={handleDateChange("from")}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                        />
                    </Box>}
                    {showToDateFilter && <Box className="col-12 col-md-6 col-lg-3">
                        <TextField
                            id="sla-report-to"
                            label="To Date"
                            type="date"
                            value={activeDateRange.to}
                            onChange={handleDateChange("to")}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                        />
                    </Box>}
                </Box>

                <Box className="row g-3">
                    {showModuleFilter && <Box className="col-12 col-md-6">
                        <GenericDropdown
                            id="sla-report-category"
                            label="Module"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>}
                    {showSubModuleFilter && <Box className="col-12 col-md-6">
                        <GenericDropdown
                            id="sla-report-subcategory"
                            label="Sub Module"
                            value={selectedSubCategory}
                            onChange={handleSubCategoryChange}
                            options={subCategoryOptions}
                            fullWidth
                            className="w-100"
                            disabled={selectedCategory === "All"}
                        />
                    </Box>}
                </Box>
            </Box>

            <Box className="row g-3 mt-1">
                {showZoneFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-zone" label="Zone" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value as string)} options={zoneOptions} fullWidth className="w-100" />
                </Box>}
                {showRegionFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-region" label="Region" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value as string)} options={regionOptions} fullWidth className="w-100" disabled={selectedZone === "All"} />
                </Box>}
                {showDistrictFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-district" label="District" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value as string)} options={districtOptions} fullWidth className="w-100" disabled={selectedRegion === "All"} />
                </Box>}
                {showIssueTypeFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-issue-type" label="Issue Type" value={selectedIssueType} onChange={(e) => setSelectedIssueType(e.target.value as string)} options={issueTypeOptions} fullWidth className="w-100" />
                </Box>}
                {showDivisionFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-division" label="Division" value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value as string)} options={divisionOptions} fullWidth className="w-100" />
                </Box>}
                {showBreachedFilter && <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-breached" label="Breached" value={selectedBreached} onChange={(e) => setSelectedBreached(e.target.value as "ALL" | "BREACHED" | "BREACHED_IN")} options={breachedOptions} fullWidth className="w-100" />
                </Box>}
            </Box>

            {showSlaPerformanceReport && <SlaPerformanceReport params={extendedRequestParams} />}
        </div>
    );
};

export default SlaReports;
