import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import CustomMetricCard, { MetricCardData } from "../Dashboard/CustomMetricCard";
import { useApi } from "../../hooks/useApi";
import { fetchTicketSummaryReport } from "../../services/ReportService";
import { MISReportRequestParams } from "../../types/reports";
// import { TicketSummaryReport } from "../../types/reports";

interface TicketSummaryReportProps {
    params?: MISReportRequestParams;
}

const TicketSummaryReport: React.FC<TicketSummaryReportProps> = ({ params }) => {
    // const { data, pending, apiHandler } = useApi<TicketSummaryReport>();
    const { data, pending, apiHandler } = useApi<any>();

    useEffect(() => {
        apiHandler(() => fetchTicketSummaryReport(params));
    }, [apiHandler, params]);

    const getStatusCount = (...keys: string[]) => keys.reduce((sum, key) => sum + (data?.statusCounts?.[key] ?? 0), 0);

    const statusData = useMemo(() => {
        const entries = Object.entries(data?.statusCounts ?? {});
        const formatStatusLabel = (value: string) =>
            value
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase());

        const statusColorPalette = ["#1976d2", "#2e7d32", "#ef6c00", "#6a1b9a", "#00838f", "#c62828", "#5d4037", "#455a64"];

        return entries.map(([status, value], index) => ({
            key: status,
            name: formatStatusLabel(status),
            value: typeof value === "number" ? value : 0,
            color: statusColorPalette[index % statusColorPalette.length],
        }));
    }, [data?.statusCounts]);

    const statusPieChartOptions = useMemo(() => {
        const overallTickets = data?.totalTickets ?? 0;
        return {
            tooltip: { trigger: "item" },
            legend: {
                orient: "horizontal",
                bottom: 0,
            },
            series: [
                {
                    name: "Tickets by Status",
                    type: "pie",
                    radius: ["45%", "75%"],
                    center: ["50%", "42%"],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: "#fff",
                        borderWidth: 1,
                    },
                    label: {
                        show: true,
                        formatter: "{b}: {c}",
                        fontSize: 11,
                    },
                    data: statusData.map((entry) => ({
                        value: entry.value,
                        name: entry.name,
                        itemStyle: { color: entry.color },
                    })),
                },
            ],
            graphic: [
                {
                    type: "text",
                    left: "center",
                    top: "36%",
                    style: {
                        text: String(overallTickets),
                        fill: "#37474f",
                        fontSize: 20,
                        fontWeight: 700,
                    },
                },
                {
                    type: "text",
                    left: "center",
                    top: "45%",
                    style: {
                        text: "Total",
                        fill: "#78909c",
                        fontSize: 12,
                    },
                },
            ],
        };
    }, [data?.totalTickets, statusData]);

    const ticketLifecycleSunburstOptions = useMemo(() => {
        const openCount = getStatusCount("OPEN");
        const reopenedCount = getStatusCount("REOPENED");
        const assignedCount = getStatusCount("ASSIGNED");
        const pendingWithRequester = getStatusCount("PENDING_WITH_REQUESTER");
        const pendingWithFci = getStatusCount("PENDING_WITH_FCI");
        const pendingWithVendor = getStatusCount("PENDING_WITH_SERVICE_PROVIDER");
        const onHoldCount = getStatusCount("ON_HOLD");
        const pendingCount = getStatusCount("PENDING") + onHoldCount + pendingWithRequester + pendingWithFci + pendingWithVendor;
        const pendingForFeedbackCount = getStatusCount("PENDING_FOR_FEEDBACK", "AWAITING_ESCALATION_APPROVAL");
        const feedbackSubmittedCount = getStatusCount("FEEDBACK_SUBMITTED", "ESCALATED");
        const resolvedCount = getStatusCount("RESOLVED") + pendingForFeedbackCount + feedbackSubmittedCount;
        const closedCount = getStatusCount("CLOSED");

        return { openCount, reopenedCount, assignedCount, pendingWithRequester, pendingWithFci, pendingWithVendor, pendingCount, pendingForFeedbackCount, feedbackSubmittedCount, resolvedCount, closedCount };
    }, [data?.statusCounts]);

    const ticketMetricsCardData = useMemo<MetricCardData>(() => {
        const { openCount, reopenedCount, assignedCount, pendingWithRequester, pendingWithFci, pendingWithVendor, pendingCount, pendingForFeedbackCount, feedbackSubmittedCount, resolvedCount, closedCount } = ticketLifecycleSunburstOptions;
        const unacknowledgedCount = openCount + reopenedCount;
        const acknowledgedCount = assignedCount + pendingCount + resolvedCount + closedCount;

        return {
            title: { text: "Total Tickets Raised", textSize: 12, textColor: "text.secondary" },
            metricValue: { text: String(data?.totalTickets ?? 0), textSize: 24, textColor: "text.primary" },
            backgroundColor: "background.paper",
            children: [
                {
                    title: { text: "Unacknowledged" },
                    metricValue: { text: String(unacknowledgedCount), textColor: "info.main" },
                    backgroundColor: "background.default",
                    children: [
                        { title: { text: "Open" }, metricValue: { text: String(openCount) }, backgroundColor: "background.paper" },
                        { title: { text: "Re-opened" }, metricValue: { text: String(reopenedCount) }, backgroundColor: "background.paper" },
                    ],
                },
                {
                    title: { text: "Acknowledged" },
                    metricValue: { text: String(acknowledgedCount), textColor: "success.main" },
                    backgroundColor: "background.default",
                    children: [
                        { title: { text: "Assigned" }, metricValue: { text: String(assignedCount) }, backgroundColor: "background.paper" },
                        {
                            title: { text: "Pending" },
                            metricValue: { text: String(pendingCount) },
                            backgroundColor: "background.paper",
                            children: [
                                { title: { text: "With Requestor" }, metricValue: { text: String(pendingWithRequester) } },
                                { title: { text: "With FCI" }, metricValue: { text: String(pendingWithFci) } },
                                { title: { text: "With Vendor" }, metricValue: { text: String(pendingWithVendor) } },
                            ],
                        },
                        {
                            title: { text: "Resolved" },
                            metricValue: { text: String(resolvedCount) },
                            backgroundColor: "background.paper",
                            children: [
                                { title: { text: "Pending for Feedback" }, metricValue: { text: String(pendingForFeedbackCount) } },
                                { title: { text: "Feedback Submitted" }, metricValue: { text: String(feedbackSubmittedCount) } },
                            ],
                        },
                        { title: { text: "Closed" }, metricValue: { text: String(closedCount) }, backgroundColor: "background.paper" },
                    ],
                },
            ],
        };
    }, [data?.totalTickets, ticketLifecycleSunburstOptions]);

    return (
        <CustomFieldset title="Ticket Summary Report" variant="bordered">
            {pending && (
                <Typography variant="body2" fontStyle="italic">
                    Loading ticket summary...
                </Typography>
            )}

            {!pending && data && (
                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexWrap="wrap" gap={4}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.totalTickets}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Open Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.openTickets}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Closed Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.closedTickets}
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={4}>
                        <Box width="100%">
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Overall Tickets - Categorized by Status
                            </Typography>
                            <ReactECharts option={statusPieChartOptions} style={{ height: 340 }} />
                        </Box>
                        <Box width="100%">
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Tickets Count
                            </Typography>
                            <CustomMetricCard {...ticketMetricsCardData} />
                        </Box>
                    </Box>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default TicketSummaryReport;
