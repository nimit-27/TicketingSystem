import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import TicketSummaryReport from "../components/MISReports/TicketSummaryReport";
import TicketResolutionTimeReport from "../components/MISReports/TicketResolutionTimeReport";
import CustomerSatisfactionReport from "../components/MISReports/CustomerSatisfactionReport";
import ProblemManagementReport from "../components/MISReports/ProblemManagementReport";
import Title from "../components/Title";
import { useSnackbar } from "../context/SnackbarContext";
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

const MISReports: React.FC = () => {
    const [downloading, setDownloading] = useState(false);
    const { showMessage } = useSnackbar();

    const handleDownload = async () => {
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

            const summarySheetData = [
                ["Ticket Summary"],
                ["Metric", "Value"],
                ["Total Tickets", ticketSummary.totalTickets],
                ["Open Tickets", ticketSummary.openTickets],
                ["Closed Tickets", ticketSummary.closedTickets],
                [],
                ["Status", "Count"],
                ...Object.entries(ticketSummary.statusCounts ?? {}).map(([status, count]) => [status, count]),
                [],
                ["Mode", "Count"],
                ...Object.entries(ticketSummary.modeCounts ?? {}).map(([mode, count]) => [mode, count]),
            ];

            const resolutionSheetData = [
                ["Ticket Resolution Time"],
                ["Metric", "Value"],
                ["Average Resolution Hours", resolutionTime.averageResolutionHours],
                ["Resolved Tickets Considered", resolutionTime.resolvedTicketCount],
                [],
                ["Status", "Average Hours"],
                ...Object.entries(resolutionTime.averageResolutionHoursByStatus ?? {}).map(([status, hours]) => [
                    status,
                    hours,
                ]),
            ];

            const satisfactionSheetData = [
                ["Customer Satisfaction"],
                ["Metric", "Score"],
                ["Total Feedback Responses", satisfaction.totalResponses],
                ["Overall Satisfaction Average", satisfaction.overallSatisfactionAverage],
                ["Resolution Effectiveness Average", satisfaction.resolutionEffectivenessAverage],
                ["Communication & Support Average", satisfaction.communicationSupportAverage],
                ["Timeliness Average", satisfaction.timelinessAverage],
                ["Composite Score", satisfaction.compositeScore],
            ];

            const problemSheetData = [
                ["Problem Management"],
                ["Category", "Ticket Count"],
                ...(problemManagement.categoryStats ?? []).map(({ category, ticketCount }) => [
                    category,
                    ticketCount,
                ]),
            ];

            const workbook = XLSX.utils.book_new();
            const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
            const resolutionSheet = XLSX.utils.aoa_to_sheet(resolutionSheetData);
            const satisfactionSheet = XLSX.utils.aoa_to_sheet(satisfactionSheetData);
            const problemSheet = XLSX.utils.aoa_to_sheet(problemSheetData);

            XLSX.utils.book_append_sheet(workbook, summarySheet, "Ticket Summary");
            XLSX.utils.book_append_sheet(workbook, resolutionSheet, "Resolution Time");
            XLSX.utils.book_append_sheet(workbook, satisfactionSheet, "Customer Satisfaction");
            XLSX.utils.book_append_sheet(workbook, problemSheet, "Problem Management");

            const fileName = `mis-reports-${new Date().toISOString().split("T")[0]}.xlsx`;
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

    return (
        <Box display="flex" flexDirection="column" gap={3} p={2}>
            <Title
                textKey="Management Information System Reports"
                rightContent={(
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? "Preparing..." : "Download Excel"}
                    </Button>
                )}
            />
            {/* <Typography variant="h4" fontWeight={700} gutterBottom>
                Management Information System Reports
            </Typography> */}

            <TicketSummaryReport />
            <TicketResolutionTimeReport />
            <CustomerSatisfactionReport />
            <ProblemManagementReport />
        </Box>
    );
};

export default MISReports;
