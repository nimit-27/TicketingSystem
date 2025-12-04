import React, { useMemo, useState } from "react";
import { Box, Button, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import SlaPerformanceReport from "../components/MISReports/SlaPerformanceReport";
import Title from "../components/Title";
import { useSnackbar } from "../context/SnackbarContext";
import MISReportGenerator from "../components/MISReports/MISReportGenerator";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import { getCurrentUserDetails } from "../config/config";
import {
    fetchCustomerSatisfactionReport,
    fetchProblemManagementReport,
    fetchTicketResolutionTimeReport,
    fetchTicketSummaryReport,
} from "../services/ReportService";
import {
    CustomerSatisfactionReportProps,
    MISReportRequestParams,
    ProblemManagementReportProps,
    TicketResolutionTimeReportProps,
    TicketSummaryReportProps,
    SupportDashboardTimeRange,
    SupportDashboardTimeScale,
} from "../types/reports";
import { getPeriodLabel, ReportPeriod, ReportRange } from "../utils/reportPeriods";
import { useCategoryFilters } from "../hooks/useCategoryFilters";

const extractApiPayload = <T,>(response: any): T | null => {
    const rawPayload = response?.data ?? response;
    const resp = rawPayload?.body ?? rawPayload;

    if (resp && typeof resp === "object" && "success" in resp && resp.success === false) {
        const message = resp?.error?.message ?? "Unable to fetch report data.";
        throw new Error(message);
    }

    if (resp && typeof resp === "object" && "data" in resp) {
        return (resp.data ?? null) as T | null;
    }

    return (resp ?? null) as T | null;
};

const calculateColumnWidths = (rows: (string | number)[][]) => {
    const widths: { wch: number }[] = [];

    rows.forEach((row) => {
        row.forEach((cell, columnIndex) => {
            const value = cell == null ? "" : String(cell);
            const maxLineLength = Math.max(...value.split("\n").map((line) => line.length));
            const paddedWidth = maxLineLength + 2; // add small padding for readability

            widths[columnIndex] = {
                wch: Math.max(widths[columnIndex]?.wch ?? 0, paddedWidth, 12), // enforce a sensible minimum
            };
        });
    });

    return widths;
};

const applyThinBorders = (worksheet: XLSX.WorkSheet) => {
    const range = worksheet["!ref"] ? XLSX.utils.decode_range(worksheet["!ref"] as string) : null;
    if (!range) return;

    const borderStyle = { style: "thin", color: { auto: 1 } } as any;
    // const borderStyle = { style: "thin", color: { auto: 1 } } as XLSX.BorderStyleSpec;

    for (let row = range.s.r; row <= range.e.r; row += 1) {
        for (let col = range.s.c; col <= range.e.c; col += 1) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = (worksheet[cellAddress] || { t: "s", v: "" }) as XLSX.CellObject;
            cell.s = {
                ...(cell.s || {}),
                border: {
                    top: borderStyle,
                    bottom: borderStyle,
                    left: borderStyle,
                    right: borderStyle,
                },
                // } as XLSX.CellStyle;
            } as any;
            worksheet[cellAddress] = cell;
        }
    }
};

const ADMIN_ROLES = new Set(["Team Lead", "System Administrator", "Regional Nodal Officer"]);

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const timeScaleOptions: { value: SupportDashboardTimeScale; label: string }[] = [
    { value: "DAILY", label: "Interval" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "CUSTOM", label: "Custom" },
];

const timeRangeOptions: Record<SupportDashboardTimeScale, { value: SupportDashboardTimeRange; label: string }[]> = {
    DAILY: [
        { value: "LAST_7_DAYS", label: "Last 7 Days" },
        { value: "LAST_30_DAYS", label: "Last 30 Days" },
    ],
    WEEKLY: [
        { value: "LAST_4_WEEKS", label: "Last 4 Weeks" },
    ],
    MONTHLY: [
        { value: "LAST_6_MONTHS", label: "Last 6 Months" },
        { value: "CURRENT_YEAR", label: "Current Year" },
        { value: "LAST_YEAR", label: "Previous Year" },
        { value: "LAST_5_YEARS", label: "Last 5 Years" },
        { value: "CUSTOM_MONTH_RANGE", label: "Custom Range" },
        { value: "ALL_TIME", label: "All Time" },
    ],
    YEARLY: [
        { value: "YEAR_TO_DATE", label: "Year To Date" },
        { value: "LAST_YEAR", label: "Previous Year" },
        { value: "LAST_5_YEARS", label: "Last 5 Years" },
    ],
    CUSTOM: [{ value: "CUSTOM_DATE_RANGE", label: "Custom Dates" }],
};

const startOfWeek = (date: Date) => {
    const clone = new Date(date);
    const day = clone.getDay();
    const diff = (day + 6) % 7;
    clone.setDate(clone.getDate() - diff);
    return clone;
};

const endOfWeek = (date: Date) => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
};

const startOfYear = (year: number) => new Date(year, 0, 1);
const endOfYear = (year: number) => new Date(year, 11, 31);
const endOfMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0);

const calculateDateRange = (
    timeScale: SupportDashboardTimeScale,
    timeRange: SupportDashboardTimeRange,
    customMonthRange: { start: number | null; end: number | null },
) => {
    const today = new Date();

    const buildRange = (from: Date | null, to: Date | null) => ({
        from: from ? formatDateInput(from) : "",
        to: to ? formatDateInput(to) : "",
    });

    if (timeScale === "CUSTOM" || timeRange === "CUSTOM_DATE_RANGE") {
        return buildRange(null, null);
    }

    switch (timeScale) {
        case "DAILY": {
            if (timeRange === "LAST_DAY") {
                const from = new Date(today);
                from.setDate(from.getDate() - 1);
                return buildRange(from, today);
            }

            if (timeRange === "LAST_7_DAYS") {
                const from = new Date(today);
                from.setDate(from.getDate() - 6);
                return buildRange(from, today);
            }

            const from = new Date(today);
            from.setDate(from.getDate() - 29);
            return buildRange(from, today);
        }
        case "WEEKLY": {
            if (timeRange === "THIS_WEEK") {
                return buildRange(startOfWeek(today), endOfWeek(today));
            }

            if (timeRange === "LAST_WEEK") {
                const start = startOfWeek(today);
                start.setDate(start.getDate() - 7);
                const end = endOfWeek(start);
                return buildRange(start, end);
            }

            const start = startOfWeek(today);
            start.setDate(start.getDate() - 21);
            const end = endOfWeek(today);
            return buildRange(start, end);
        }
        case "MONTHLY": {
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();

            if (timeRange === "LAST_6_MONTHS") {
                const startMonth = new Date(today);
                startMonth.setMonth(currentMonth - 5, 1);
                const endMonth = endOfMonth(currentYear, currentMonth);
                return buildRange(startMonth, endMonth);
            }

            if (timeRange === "CURRENT_YEAR") {
                return buildRange(startOfYear(currentYear), today);
            }

            if (timeRange === "LAST_YEAR") {
                return buildRange(startOfYear(currentYear - 1), endOfYear(currentYear - 1));
            }

            if (timeRange === "LAST_5_YEARS") {
                return buildRange(startOfYear(currentYear - 4), endOfMonth(currentYear, currentMonth));
            }

            if (timeRange === "ALL_TIME") {
                return buildRange(null, null);
            }

            if (timeRange === "CUSTOM_MONTH_RANGE") {
                const { start, end } = customMonthRange;

                if (start === null || end === null) {
                    return buildRange(null, null);
                }

                const safeStart = startOfYear(start);
                const safeEnd = endOfYear(end);
                return buildRange(safeStart, safeEnd);
            }

            return buildRange(null, null);
        }
        case "YEARLY": {
            const currentYear = today.getFullYear();

            if (timeRange === "YEAR_TO_DATE") {
                return buildRange(startOfYear(currentYear), today);
            }

            if (timeRange === "LAST_YEAR") {
                return buildRange(startOfYear(currentYear - 1), endOfYear(currentYear - 1));
            }

            return buildRange(startOfYear(currentYear - 4), endOfYear(currentYear));
        }
        default:
            return buildRange(null, null);
    }
};
const MISReports: React.FC = () => {
    const [downloading, setDownloading] = useState(false);
    const { showMessage } = useSnackbar();
    const userDetails = useMemo(() => getCurrentUserDetails(), []);
    const { categoryOptions, subCategoryOptions, loadSubCategories, resetSubCategories } = useCategoryFilters();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
    const [timeScale, setTimeScale] = useState<SupportDashboardTimeScale>("DAILY");
    const [timeRange, setTimeRange] = useState<SupportDashboardTimeRange>("LAST_30_DAYS");
    const [customMonthRange, setCustomMonthRange] = useState<{ start: number | null; end: number | null }>(() => ({
        start: null,
        end: null,
    }));
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() =>
        calculateDateRange("DAILY", "LAST_30_DAYS", { start: null, end: null }),
    );
    const availableTimeRanges = useMemo(() => timeRangeOptions[timeScale] ?? [], [timeScale]);

    const viewScope: MISReportRequestParams["scope"] = useMemo(() => {
        const roles = userDetails?.role ?? [];
        return roles.some((role) => ADMIN_ROLES.has(role)) ? "all" : "user";
    }, [userDetails?.role]);

    const activeDateRange = useMemo(() => {
        if (timeScale === "CUSTOM" || timeRange === "CUSTOM_DATE_RANGE") {
            return dateRange;
        }

        return calculateDateRange(timeScale, timeRange, customMonthRange);
    }, [customMonthRange, dateRange, timeRange, timeScale]);

    const requestParams = useMemo<MISReportRequestParams>(() => {
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

    const downloadExcel = async (period: ReportPeriod, range: ReportRange) => {
        setDownloading(true);

        try {
            const [
                ticketSummaryResponse,
                resolutionResponse,
                satisfactionResponse,
                problemResponse,
            ] = await Promise.all([
                fetchTicketSummaryReport(requestParams),
                fetchTicketResolutionTimeReport(requestParams),
                fetchCustomerSatisfactionReport(requestParams),
                fetchProblemManagementReport(requestParams),
            ]);

            const ticketSummary = extractApiPayload<TicketSummaryReportProps>(ticketSummaryResponse);
            const resolutionTime = extractApiPayload<TicketResolutionTimeReportProps>(resolutionResponse);
            const satisfaction = extractApiPayload<CustomerSatisfactionReportProps>(satisfactionResponse);
            const problemManagement = extractApiPayload<ProblemManagementReportProps>(problemResponse);

            if (!ticketSummary || !resolutionTime || !satisfaction || !problemManagement) {
                throw new Error("Incomplete data received for MIS reports.");
            }

            const downloadedBy = userDetails?.username || userDetails?.userId || "Unknown User";
            const downloadedOn = new Date();
            const fromDateLabel = requestParams.fromDate || formatDateInput(range.startDate);
            const toDateLabel = requestParams.toDate || formatDateInput(range.endDate);
            const formatDisplayDate = (value: string | Date) =>
                new Date(value).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            const formatDisplayDateTime = (value: Date) =>
                value.toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });

            const buildHorizontalSection = (title: string, headers: (string | number)[], values: (string | number)[]) => [
                [title],
                headers,
                values,
                [],
            ];

            const buildMetadataRows = (title: string) => [
                [title],
                ["Report Generated By", downloadedBy],
                ["Generated On", formatDisplayDateTime(downloadedOn)],
                ["Date Range From", formatDisplayDate(fromDateLabel)],
                ["Date Range To", formatDisplayDate(toDateLabel)],
                [],
            ];

            const formatCategoryLabel = (item: {
                category?: string;
                subcategory?: string;
                categoryName?: string;
                subcategoryName?: string;
            }) => `${item.categoryName ?? item.category ?? "N/A"} > ${item.subcategoryName ?? item.subcategory ?? "N/A"}`;

            const summarySection = buildHorizontalSection(
                "Ticket Summary",
                [
                    "Total Tickets",
                    "Open Tickets",
                    "Closed Tickets",
                    ...Object.keys(ticketSummary.statusCounts ?? {}),
                    ...Object.keys(ticketSummary.modeCounts ?? {}),
                ],
                [
                    ticketSummary.totalTickets,
                    ticketSummary.openTickets,
                    ticketSummary.closedTickets,
                    ...Object.values(ticketSummary.statusCounts ?? {}),
                    ...Object.values(ticketSummary.modeCounts ?? {}),
                ],
            );

            const resolutionSection = buildHorizontalSection(
                "Ticket Resolution Time",
                [
                    "Average Resolution Hours",
                    "Resolved Tickets Considered",
                    ...Object.keys(resolutionTime.averageResolutionHoursByStatus ?? {}),
                ],
                [
                    resolutionTime.averageResolutionHours,
                    resolutionTime.resolvedTicketCount,
                    ...Object.values(resolutionTime.averageResolutionHoursByStatus ?? {}),
                ],
            );

            const resolutionCategorySection = (() => {
                const stats = resolutionTime.categoryStats ?? [];
                if (!stats.length) {
                    return [] as (string | number)[][];
                }

                return [
                    ["Ticket Resolution Time by Category/Subcategory"],
                    ["Category > Subcategory", "Resolved Tickets", "Closed Tickets", "Average Resolution Time"],
                    ...stats.map((stat) => [
                        formatCategoryLabel(stat),
                        stat.resolvedTickets,
                        stat.closedTickets,
                        stat.averageResolutionHours,
                    ]),
                    [],
                ];
            })();

            const resolutionCategoryPrioritySection = (() => {
                const stats = resolutionTime.categoryPriorityStats ?? [];
                if (!stats.length) {
                    return [] as (string | number)[][];
                }

                return [
                    ["Resolution by Category/Subcategory and Priority"],
                    ["Priority", "Category > Subcategory", "Avg Resolution Hours", "Resolved Tickets"],
                    ...stats.map((stat) => [
                        stat.priority,
                        formatCategoryLabel(stat),
                        stat.averageResolutionHours,
                        stat.resolvedTicketCount,
                    ]),
                    [],
                ];
            })();

            const satisfactionSection = buildHorizontalSection(
                "Customer Satisfaction",
                [
                    "Total Feedback Responses",
                    "Overall Satisfaction Average",
                    "Resolution Effectiveness Average",
                    "Communication & Support Average",
                    "Timeliness Average",
                    "Composite Score",
                ],
                [
                    satisfaction.totalResponses,
                    satisfaction.overallSatisfactionAverage,
                    satisfaction.resolutionEffectivenessAverage,
                    satisfaction.communicationSupportAverage,
                    satisfaction.timelinessAverage,
                    satisfaction.compositeScore,
                ],
            );

            const satisfactionCategorySection = (() => {
                const stats = satisfaction.categoryStats ?? [];
                if (!stats.length) {
                    return [] as (string | number)[][];
                }

                return [
                    ["Customer Satisfaction by Category/Subcategory"],
                    [
                        "Category > Subcategory",
                        "Overall Satisfaction Avg",
                        "Resolution Effectiveness Avg",
                        "Communication & Support Avg",
                        "Timeliness Avg",
                        "Composite Score",
                        "Responses",
                    ],
                    ...stats.map((stat) => [
                        formatCategoryLabel(stat),
                        stat.overallSatisfactionAverage,
                        stat.resolutionEffectivenessAverage,
                        stat.communicationSupportAverage,
                        stat.timelinessAverage,
                        stat.compositeScore,
                        stat.totalResponses ?? "N/A",
                    ]),
                    [],
                ];
            })();

            const satisfactionBreakdownSection = (() => {
                const breakdown = satisfaction.priorityBreakdown ?? [];
                if (!breakdown.length) {
                    return [] as (string | number)[][];
                }

                const ratingHeaders = Array.from(
                    breakdown.reduce((set, stat) => {
                        Object.keys(stat.ratingCounts ?? {}).forEach((rating) => set.add(rating));
                        return set;
                    }, new Set<string>()),
                );

                return [
                    ["Customer Satisfaction by Category/Subcategory and Priority"],
                    [
                        "Priority",
                        "Category > Subcategory",
                        "Ticket Count",
                        "Breached Tickets",
                        ...ratingHeaders,
                        "Total",
                    ],
                    ...breakdown.map((stat) => [
                        stat.priority,
                        formatCategoryLabel(stat),
                        stat.ticketCount ?? 0,
                        stat.breachedTickets ?? 0,
                        ...ratingHeaders.map((rating) => stat.ratingCounts?.[rating] ?? 0),
                        stat.totalResponses,
                    ]),
                    [],
                ];
            })();

            const problemEntries = problemManagement.categoryStats ?? [];
            const problemSection = problemEntries.length
                ? [
                    ["Problem Management"],
                    ["Category > Subcategory", "Ticket Count", "Breached Tickets"],
                    ...problemEntries.map((entry) => [
                        formatCategoryLabel(entry),
                        entry.ticketCount,
                        entry.breachedTickets ?? 0,
                    ]),
                    [],
                ]
                : [["Problem Management"], ["Category", "Ticket Count"], ["N/A", "N/A"], []];

            const workbook = XLSX.utils.book_new();

            const sheetDefinitions: { name: string; rows: (string | number)[][] }[] = [
                {
                    name: "Ticket Summary",
                    rows: [...buildMetadataRows("Ticket Summary Report"), ...summarySection],
                },
                {
                    name: "Resolution Time",
                    rows: [
                        ...buildMetadataRows("Ticket Resolution Time Report"),
                        ...resolutionSection,
                        ...resolutionCategorySection,
                        ...resolutionCategoryPrioritySection,
                    ],
                },
                {
                    name: "Customer Satisfaction",
                    rows: [
                        ...buildMetadataRows("Customer Satisfaction Report"),
                        ...satisfactionSection,
                        ...satisfactionCategorySection,
                        ...satisfactionBreakdownSection,
                    ],
                },
                {
                    name: "Problem Management",
                    rows: [...buildMetadataRows("Problem Management Report"), ...problemSection],
                },
            ];

            sheetDefinitions.forEach(({ name, rows }) => {
                const worksheet = XLSX.utils.aoa_to_sheet(rows);
                worksheet["!cols"] = calculateColumnWidths(rows);
                applyThinBorders(worksheet);
                XLSX.utils.book_append_sheet(workbook, worksheet, name);
            });

            const formattedEndDate = toDateLabel;
            const fileName = `mis-reports-${period}-${formattedEndDate}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            showMessage("MIS reports downloaded successfully.", "success");
        } catch (error) {
            console.error("Failed to download MIS reports", error);
            const message = error instanceof Error ? error.message : "Failed to download MIS reports.";
            showMessage(message, "error");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownload = async (option: string, period: ReportPeriod, range: ReportRange) => {
        if (option === "excel") {
            await downloadExcel(period, range);
            return;
        }

        showMessage(`${option.toUpperCase()} downloads are not available yet.`, "info");
    };

    const handleEmail = (period: ReportPeriod, range: ReportRange) => {
        const formattedRange = `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`;
        showMessage(
            `${getPeriodLabel(period)} report for ${formattedRange} will be emailed once ready.`,
            "success",
        );
    };

    let misReportGeneratorComponent = <MISReportGenerator
        onDownload={handleDownload}
        onEmail={handleEmail}
        defaultPeriod="daily"
        busy={downloading}
    />

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
                            label="Category"
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
                            label="Subcategory"
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
