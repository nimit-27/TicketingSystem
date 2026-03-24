import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import Title from "../components/Title";
import MISReportGenerator from "../components/MISReports/MISReportGenerator";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import SlaPerformanceReport from "../components/MISReports/SlaPerformanceReport";
import { timeScaleOptions } from "../utils/misReports";
import { useMisReportFilters } from "../hooks/useMisReportFilters";
import { useMisReportDownloader } from "../hooks/useMisReportDownloader";
import { useApi } from "../hooks/useApi";
import { getZones, getRegions, getDistricts } from "../services/LocationService";
import { getIssueTypes } from "../services/IssueTypeService";
import { getDivisions } from "../services/DivisionService";
import { getDropdownOptionsWithExtraOption } from "../utils/Utils";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";

const SlaReports: React.FC = () => {
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
        viewScope,
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
            zoneCode: selectedZone !== "All" ? selectedZone : undefined,
            regionCode: selectedRegion !== "All" ? selectedRegion : undefined,
            districtCode: selectedDistrict !== "All" ? selectedDistrict : undefined,
            issueTypeId: selectedIssueType !== "All" ? selectedIssueType : undefined,
            division: selectedDivision !== "All" ? selectedDivision : undefined,
            breachedFilter: selectedBreached,
        }),
        [requestParams, selectedBreached, selectedDistrict, selectedDivision, selectedIssueType, selectedRegion, selectedZone],
    );

    const { downloading, handleDownload, handleEmail } = useMisReportDownloader(extendedRequestParams);

    const misReportGeneratorComponent = (
        <MISReportGenerator
            onDownload={handleDownload}
            onEmail={handleEmail}
            defaultPeriod="monthly"
            busy={downloading}
        />
    );

    return (
        <div className="d-flex flex-column flex-grow-1">
            <Title textKey="SLA Reports" rightContent={misReportGeneratorComponent} />

            <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle2" color="text.secondary">
                    Viewing data for {viewScope === "all" ? "all tickets" : "your workload"}
                </Typography>
                <Box className="row g-3" alignItems="stretch">
                    <Box className="col-12 col-md-6 col-lg-3 d-flex">
                        <GenericDropdown
                            id="sla-report-interval"
                            label="Interval"
                            value={timeScale}
                            onChange={handleTimeScaleChange}
                            options={timeScaleOptions.filter((option) => option.value !== "CUSTOM")}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    <Box className="col-12 col-md-6 col-lg-3 d-flex">
                        <GenericDropdown
                            id="sla-report-range"
                            label="Range"
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            options={availableTimeRanges}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    <Box className="col-12 col-md-6 col-lg-3">
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
                    </Box>
                    <Box className="col-12 col-md-6 col-lg-3">
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
                    </Box>
                </Box>

                <Box className="row g-3">
                    <Box className="col-12 col-md-6">
                        <GenericDropdown
                            id="sla-report-category"
                            label="Module"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    <Box className="col-12 col-md-6">
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
                    </Box>
                </Box>
            </Box>

            <Box className="row g-3 mt-1">
                <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-zone" label="Zone" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value as string)} options={zoneOptions} fullWidth className="w-100" />
                </Box>
                <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-region" label="Region" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value as string)} options={regionOptions} fullWidth className="w-100" disabled={selectedZone === "All"} />
                </Box>
                <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-district" label="District" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value as string)} options={districtOptions} fullWidth className="w-100" disabled={selectedRegion === "All"} />
                </Box>
                <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-issue-type" label="Issue Type" value={selectedIssueType} onChange={(e) => setSelectedIssueType(e.target.value as string)} options={issueTypeOptions} fullWidth className="w-100" />
                </Box>
                <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-division" label="Division" value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value as string)} options={divisionOptions} fullWidth className="w-100" />
                </Box>
                <Box className="col-12 col-md-6 col-lg-3 d-flex">
                    <GenericDropdown id="sla-report-breached" label="Breached" value={selectedBreached} onChange={(e) => setSelectedBreached(e.target.value as "ALL" | "BREACHED" | "BREACHED_IN")} options={breachedOptions} fullWidth className="w-100" />
                </Box>
            </Box>

            <SlaPerformanceReport params={extendedRequestParams} />
        </div>
    );
};

export default SlaReports;
