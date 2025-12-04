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

const MISReports: React.FC = () => {
    const [downloading, setDownloading] = useState(false);
    const { showMessage } = useSnackbar();
    const userDetails = useMemo(() => getCurrentUserDetails(), []);
    const { categoryOptions, subCategoryOptions, loadSubCategories, resetSubCategories } = useCategoryFilters();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() => {
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 30);
        return { from: formatDateInput(start), to: formatDateInput(today) };
    });

    const viewScope: MISReportRequestParams["scope"] = useMemo(() => {
        const roles = userDetails?.role ?? [];
        return roles.some((role) => ADMIN_ROLES.has(role)) ? "all" : "user";
    }, [userDetails?.role]);

    const requestParams = useMemo<MISReportRequestParams>(() => {
        const categoryId = selectedCategory === "All" ? undefined : selectedCategory;
        const subCategoryId = categoryId && selectedSubCategory !== "All" ? selectedSubCategory : undefined;

        return {
            fromDate: dateRange.from,
            toDate: dateRange.to,
            scope: viewScope,
            userId: userDetails?.userId,
            categoryId,
            subCategoryId,
        };
    }, [dateRange.from, dateRange.to, selectedCategory, selectedSubCategory, userDetails?.userId, viewScope]);

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

            <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle2" color="text.secondary">
                    Viewing data for {viewScope === "all" ? "all tickets" : "your workload"}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        id="mis-report-from"
                        label="From Date"
                        type="date"
                        value={dateRange.from}
                        onChange={handleDateChange("from")}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                    <TextField
                        id="mis-report-to"
                        label="To Date"
                        type="date"
                        value={dateRange.to}
                        onChange={handleDateChange("to")}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Box>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <GenericDropdown
                        id="mis-report-category"
                        label="Category"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        fullWidth
                    />
                    <GenericDropdown
                        id="mis-report-subcategory"
                        label="Subcategory"
                        value={selectedSubCategory}
                        onChange={handleSubCategoryChange}
                        options={subCategoryOptions}
                        fullWidth
                        disabled={selectedCategory === "All"}
                    />
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
