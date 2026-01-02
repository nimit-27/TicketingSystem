import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Title from "../components/Title";
import MISReportGenerator from "../components/MISReports/MISReportGenerator";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import { timeScaleOptions, timeRangeOptions } from "../utils/misReports";
import { useMisReportFilters } from "../hooks/useMisReportFilters";
import { useMisReportDownloader } from "../hooks/useMisReportDownloader";

const MISReports: React.FC = () => {
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

    let misReportGeneratorComponent = <MISReportGenerator
        onDownload={handleDownload}
        onEmail={handleEmail}
        defaultPeriod="daily"
        busy={downloading}
    />;
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
                            id="mis-report-category"
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

            <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                    View individual MIS report pages
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button component={RouterLink} to="/mis-reports/ticket-summary" variant="outlined">
                        Ticket Summary
                    </Button>
                    <Button component={RouterLink} to="/mis-reports/resolution-time" variant="outlined">
                        Resolution Time
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/mis-reports/customer-satisfaction"
                        variant="outlined"
                    >
                        Customer Satisfaction
                    </Button>
                    <Button component={RouterLink} to="/mis-reports/problem-management" variant="outlined">
                        Problem Management
                    </Button>
                </Box>
            </Box>
        </div>
    );
};

export default MISReports;
