import React, { useMemo, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import * as XLSX from "xlsx";
import TicketSummaryReport from "../components/MISReports/TicketSummaryReport";
import TicketResolutionTimeReport from "../components/MISReports/TicketResolutionTimeReport";
import CustomerSatisfactionReport from "../components/MISReports/CustomerSatisfactionReport";
import ProblemManagementReport from "../components/MISReports/ProblemManagementReport";
import SlaPerformanceReport from "../components/MISReports/SlaPerformanceReport";
import Title from "../components/Title";
import { useSnackbar } from "../context/SnackbarContext";
import MISReportGenerator from "../components/MISReports/MISReportGenerator";
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

    const borderStyle = { style: "thin", color: { auto: 1 } } as XLSX.BorderStyleSpec;

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
            } as XLSX.CellStyle;
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
        return {
            fromDate: dateRange.from,
            toDate: dateRange.to,
            scope: viewScope,
            userId: userDetails?.userId,
        };
    }, [dateRange.from, dateRange.to, userDetails?.userId, viewScope]);

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
            const roleLabel = (userDetails?.role ?? []).join(", ") || "N/A";
            const downloadedOn = new Date();
            const fromDateLabel = requestParams.fromDate || formatDateInput(range.startDate);
            const toDateLabel = requestParams.toDate || formatDateInput(range.endDate);
            const formatDisplayDate = (value: string | Date) =>
                new Date(value).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });

            const buildHorizontalSection = (title: string, headers: (string | number)[], values: (string | number)[]) => [
                [title],
                headers,
                values,
                [],
            ];

            const buildKeyValueSection = (
                title: string,
                entries: { key: string | number; value: string | number }[],
                headerLabels: [string, string],
            ) => [
                [title],
                headerLabels,
                ...entries.map(({ key, value }) => [key, value]),
                [],
            ];

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
                        `${stat.category} > ${stat.subcategory}`,
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
                    ["Priority", "Category > Subcategory", ...ratingHeaders, "Total"],
                    ...breakdown.map((stat) => [
                        stat.priority,
                        `${stat.category} > ${stat.subcategory}`,
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
                          `${entry.category} > ${entry.subcategory ?? "N/A"}`,
                          entry.ticketCount,
                          entry.breachedTickets ?? 0,
                      ]),
                      [],
                  ]
                : buildKeyValueSection("Problem Management", [{ key: "Category", value: "N/A" }], ["Category", "Ticket Count"]);

            const overviewSheetData = [
                ["Management Information System Report"],
                ["Report Type", "MIS Overview"],
                ["Date Range From", formatDisplayDate(fromDateLabel)],
                ["Date Range To", formatDisplayDate(toDateLabel)],
                ["Generated By", downloadedBy],
                ["Generated On", formatDisplayDate(downloadedOn)],
                ["Role", roleLabel],
                [],
                ...summarySection,
                ...resolutionSection,
                ...resolutionCategoryPrioritySection,
                ...satisfactionSection,
                ...satisfactionBreakdownSection,
                ...problemSection,
            ];

            const workbook = XLSX.utils.book_new();
            const overviewSheet = XLSX.utils.aoa_to_sheet(overviewSheetData);

            overviewSheet["!cols"] = calculateColumnWidths(overviewSheetData);
            applyThinBorders(overviewSheet);

            XLSX.utils.book_append_sheet(workbook, overviewSheet, "MIS Overview");

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

    return (
        <Box display="flex" flexDirection="column" gap={3} p={2}>
            <Title textKey="Management Information System Reports" />

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
            </Box>

            <MISReportGenerator
                onDownload={handleDownload}
                onEmail={handleEmail}
                defaultPeriod="daily"
                busy={downloading}
            />

            <SlaPerformanceReport params={requestParams} />
            <TicketSummaryReport params={requestParams} />
            <TicketResolutionTimeReport params={requestParams} />
            <CustomerSatisfactionReport params={requestParams} />
            <ProblemManagementReport params={requestParams} />
        </Box>
    );
};

export default MISReports;
