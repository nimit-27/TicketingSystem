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
        viewScope,
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

    const misReportGeneratorComponent = (
        <MISReportGenerator
            onDownload={handleDownload}
            onEmail={handleEmail}
            defaultPeriod="daily"
            busy={downloading}
        />
    );

    return (
        <div className="d-flex flex-column flex-grow-1">
            <Title textKey="Management Information System Reports" rightContent={misReportGeneratorComponent} />

            <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle2" color="text.secondary">
                    Viewing data for {viewScope === "all" ? "all tickets" : "your workload"}
                </Typography>
                <Box className="row g-3" alignItems="stretch">
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
                </Box>

                <Box className="row g-3">
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
                </Box>

                <Box className="row g-3">
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
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <TicketSummaryReport params={requestParams} />
                <TicketResolutionTimeReport params={requestParams} />
                <CustomerSatisfactionReport params={requestParams} />
                <ProblemManagementReport params={requestParams} />
            </Box>
        </div>
    );
};

export default MISReports;
