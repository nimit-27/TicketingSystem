import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
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

const MISReports: React.FC = () => {
    const [downloading, setDownloading] = useState(false);
    const { showMessage } = useSnackbar();
    const userDetails = useMemo(() => getCurrentUserDetails(), []);

    const downloadExcel = async (period: ReportPeriod, range: ReportRange) => {
        setDownloading(true);

        try {
            const [
                ticketSummaryResponse,
                resolutionResponse,
                satisfactionResponse,
                problemResponse,
            ] = await Promise.all([
                fetchTicketSummaryReport(),
                fetchTicketResolutionTimeReport(),
                fetchCustomerSatisfactionReport(),
                fetchProblemManagementReport(),
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

            const buildHorizontalSection = (title: string, headers: (string | number)[], values: (string | number)[]) => [
                [title],
                headers,
                values,
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

            const problemHeaders = (problemManagement.categoryStats ?? []).map(({ category }) => category);
            const problemValues = (problemManagement.categoryStats ?? []).map(({ ticketCount }) => ticketCount);
            const problemSection = buildHorizontalSection(
                "Problem Management",
                problemHeaders.length ? problemHeaders : ["Category"],
                problemValues.length ? problemValues : ["N/A"],
            );

            const overviewSheetData = [
                ["Downloaded By", downloadedBy],
                ["Role", roleLabel],
                ["Date", downloadedOn.toLocaleString()],
                [],
                ...summarySection,
                ...resolutionSection,
                ...satisfactionSection,
                ...problemSection,
            ];

            const workbook = XLSX.utils.book_new();
            const overviewSheet = XLSX.utils.aoa_to_sheet(overviewSheetData);

            overviewSheet["!cols"] = calculateColumnWidths(overviewSheetData);

            XLSX.utils.book_append_sheet(workbook, overviewSheet, "MIS Overview");

            const formattedEndDate = range.endDate.toISOString().split("T")[0];
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

            <MISReportGenerator
                onDownload={handleDownload}
                onEmail={handleEmail}
                defaultPeriod="daily"
                busy={downloading}
            />

            <SlaPerformanceReport />
            <TicketSummaryReport />
            <TicketResolutionTimeReport />
            <CustomerSatisfactionReport />
            <ProblemManagementReport />
        </Box>
    );
};

export default MISReports;
