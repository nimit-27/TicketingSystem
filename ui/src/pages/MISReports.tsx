import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import Title from "../components/Title";
import MISReportGenerator from "../components/MISReports/MISReportGenerator";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import { timeScaleOptions } from "../utils/misReports";
import { useMisReportFilters } from "../hooks/useMisReportFilters";
import { useMisReportDownloader } from "../hooks/useMisReportDownloader";
import TicketSummaryReport from "../components/MISReports/TicketSummaryReport";
import TicketResolutionTimeReport from "../components/MISReports/TicketResolutionTimeReport";
import CustomerSatisfactionReport from "../components/MISReports/CustomerSatisfactionReport";
import ProblemManagementReport from "../components/MISReports/ProblemManagementReport";
import { checkAccessMaster } from "../utils/permissions";
import SlaReportGenerator from "../components/MISReports/SlaReportGenerator";

const MISReports: React.FC = () => {
    const {
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
    } = useMisReportFilters();

    const { downloading, handleDownload, handleEmail } = useMisReportDownloader(requestParams);
    const hasAccess = React.useCallback((keys: string[]) => checkAccessMaster(["misReports", ...keys]), []);

    const showReportGenerator = React.useMemo(() => hasAccess(["reportGenerator"]), [hasAccess]);
    const showViewingDataText = React.useMemo(() => hasAccess(["viewingDataText"]), [hasAccess]);
    const showIntervalFilter = React.useMemo(() => hasAccess(["filters", "interval"]), [hasAccess]);
    const showRangeFilter = React.useMemo(() => hasAccess(["filters", "range"]), [hasAccess]);
    const showFromDateFilter = React.useMemo(() => hasAccess(["filters", "fromDate"]), [hasAccess]);
    const showToDateFilter = React.useMemo(() => hasAccess(["filters", "toDate"]), [hasAccess]);
    const showZoneFilter = React.useMemo(() => hasAccess(["filters", "zone"]), [hasAccess]);
    const showRegionFilter = React.useMemo(() => hasAccess(["filters", "region"]), [hasAccess]);
    const showDistrictFilter = React.useMemo(() => hasAccess(["filters", "district"]), [hasAccess]);
    const showIssueTypeFilter = React.useMemo(() => hasAccess(["filters", "issueType"]), [hasAccess]);
    const showDivisionFilter = React.useMemo(() => hasAccess(["filters", "division"]), [hasAccess]);
    const showAssigneeFilter = React.useMemo(() => hasAccess(["filters", "assignee"]), [hasAccess]);
    const showModuleFilter = React.useMemo(() => hasAccess(["filters", "module"]), [hasAccess]);
    const showSubModuleFilter = React.useMemo(() => hasAccess(["filters", "subModule"]), [hasAccess]);

    const showTicketSummaryReport = React.useMemo(() => hasAccess(["ticketSummaryReport"]), [hasAccess]);
    const showTicketResolutionTimeReport = React.useMemo(() => hasAccess(["ticketResolutionTimeReport"]), [hasAccess]);
    const showCustomerSatisfactionReport = React.useMemo(() => hasAccess(["customerSatisfactionReport"]), [hasAccess]);
    const showProblemManagementReport = React.useMemo(() => hasAccess(["problemManagementReport"]), [hasAccess]);
    const filterSummary = [
        { label: "Interval", value: timeScale },
        { label: "Range", value: timeRange },
        { label: "From Date", value: activeDateRange.from || "-" },
        { label: "To Date", value: activeDateRange.to || "-" },
        { label: "Zone", value: selectedZone },
        { label: "Region", value: selectedRegion },
        { label: "District", value: selectedDistrict },
        { label: "Issue Type", value: selectedIssueType },
        { label: "Division", value: selectedDivision },
        { label: "Assignee", value: selectedAssignee },
        { label: "Module", value: selectedCategory },
        { label: "Sub Module", value: selectedSubCategory },
    ];

    const misReportGeneratorComponent = (
        <MISReportGenerator
            onDownload={handleDownload}
            onEmail={handleEmail}
            defaultPeriod="daily"
            busy={downloading}
            filterSummary={filterSummary}
        />
    );

    return (
        <div className="d-flex flex-column flex-grow-1">
            <Title
                textKey="Management Information System Reports"
                rightContent={showReportGenerator ? <Box display="flex" gap={1}>{misReportGeneratorComponent}<SlaReportGenerator /></Box> : undefined}
            />

            <Box display="flex" flexDirection="column" gap={2}>
                {showViewingDataText && (
                    <Typography variant="subtitle2" color="text.secondary">
                        Viewing data for all tickets
                    </Typography>
                )}
                <Box className="row g-3" alignItems="stretch">
                    {showIntervalFilter && (
                    <Box className="col-12 col-md-6 col-lg-3 d-flex">
                        <GenericDropdown
                            id="mis-report-interval"
                            label="Interval"
                            value={timeScale}
                            onChange={handleTimeScaleChange}
                            options={timeScaleOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                    {showRangeFilter && (
                    <Box className="col-12 col-md-6 col-lg-3 d-flex">
                        <GenericDropdown
                            id="mis-report-range"
                            label="Range"
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            options={availableTimeRanges}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                    {showFromDateFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <TextField
                            id="mis-report-from"
                            label="From Date"
                            type="date"
                            value={activeDateRange.from}
                            onChange={handleDateChange("from")}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                        />
                    </Box>
                    )}
                    {showToDateFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <TextField
                            id="mis-report-to"
                            label="To Date"
                            type="date"
                            value={activeDateRange.to}
                            onChange={handleDateChange("to")}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                        />
                    </Box>
                    )}
                </Box>

                <Box className="row g-3">
                    {showZoneFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-zone"
                            label="Zone"
                            value={selectedZone}
                            onChange={handleZoneChange}
                            options={zoneOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                    {showRegionFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-region"
                            label="Region"
                            value={selectedRegion}
                            onChange={handleRegionChange}
                            options={regionOptions}
                            fullWidth
                            className="w-100"
                            disabled={selectedZone === "All"}
                        />
                    </Box>
                    )}
                    {showDistrictFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-district"
                            label="District"
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            options={districtOptions}
                            fullWidth
                            className="w-100"
                            disabled={selectedRegion === "All"}
                        />
                    </Box>
                    )}
                    {showIssueTypeFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-issue-type"
                            label="Issue Type"
                            value={selectedIssueType}
                            onChange={handleIssueTypeChange}
                            options={issueTypeOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                </Box>

                <Box className="row g-3">
                    {showDivisionFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-division"
                            label="Division"
                            value={selectedDivision}
                            onChange={handleDivisionChange}
                            options={divisionOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                    {showAssigneeFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-assignee"
                            label="Assignee"
                            value={selectedAssignee}
                            onChange={handleAssigneeChange}
                            options={assigneeOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                    {showModuleFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-category"
                            label="Module"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            fullWidth
                            className="w-100"
                        />
                    </Box>
                    )}
                    {showSubModuleFilter && (
                    <Box className="col-12 col-md-6 col-lg-3">
                        <GenericDropdown
                            id="mis-report-subcategory"
                            label="Sub Module"
                            value={selectedSubCategory}
                            onChange={handleSubCategoryChange}
                            options={subCategoryOptions}
                            fullWidth
                            className="w-100"
                            disabled={selectedCategory === "All"}
                        />
                    </Box>
                    )}
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {showTicketSummaryReport && <TicketSummaryReport params={requestParams} />}
                {showTicketResolutionTimeReport && <TicketResolutionTimeReport params={requestParams} />}
                {showCustomerSatisfactionReport && <CustomerSatisfactionReport params={requestParams} />}
                {showProblemManagementReport && <ProblemManagementReport params={requestParams} />}
            </Box>
        </div>
    );
};

export default MISReports;
