import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import Title from "../components/Title";
import MISReportGenerator from "../components/MISReports/MISReportGenerator";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import SlaPerformanceReport from "../components/MISReports/SlaPerformanceReport";
import { timeScaleOptions, timeRangeOptions } from "../utils/misReports";
import { useMisReportFilters } from "../hooks/useMisReportFilters";
import { useMisReportDownloader } from "../hooks/useMisReportDownloader";

const SlaReports: React.FC = () => {
    const {
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
                            options={timeScaleOptions}
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

                {timeScale === "MONTHLY" && timeRange === "CUSTOM_MONTH_RANGE" && (
                    <Box className="row g-3">
                        <Box className="col-12 col-md-6 col-lg-3">
                            <TextField
                                label="Start Year"
                                type="number"
                                size="small"
                                value={customMonthRange.start ?? ""}
                                onChange={handleCustomMonthRangeChange("start")}
                                inputProps={{ min: 1970, max: new Date().getFullYear(), step: 1 }}
                                fullWidth
                            />
                        </Box>
                        <Box className="col-12 col-md-6 col-lg-3">
                            <TextField
                                label="End Year"
                                type="number"
                                size="small"
                                value={customMonthRange.end ?? ""}
                                onChange={handleCustomMonthRangeChange("end")}
                                inputProps={{ min: 1970, max: new Date().getFullYear(), step: 1 }}
                                fullWidth
                            />
                        </Box>
                    </Box>
                )}

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

            <SlaPerformanceReport params={requestParams} />
        </div>
    );
};

export default SlaReports;
