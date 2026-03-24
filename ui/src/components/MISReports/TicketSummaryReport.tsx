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

        return {
            tooltip: { trigger: "item" },
            legend: {
                bottom: 0,
                type: "scroll",
                data: ["Open", "Re-opened", "Assigned", "Pending", "Resolved", "Closed"],
            },
            series: {
                type: "sunburst",
                data: [
                    {
                        name: "Unacknowledged (Unassigned)",
                        value: openCount + reopenedCount,
                        children: [
                            { name: "Open", value: openCount },
                            { name: "Re-opened", value: reopenedCount },
                        ],
                    },
                    {
                        name: "Acknowledged",
                        value: assignedCount + pendingCount + resolvedCount + closedCount,
                        children: [
                            { name: "Assigned", value: assignedCount },
                            {
                                name: "Pending",
                                value: pendingCount,
                                children: [
                                    { name: "With Requestor", value: pendingWithRequester },
                                    { name: "With FCI", value: pendingWithFci },
                                    { name: "With Vendor", value: pendingWithVendor },
                                ],
                            },
                            {
                                name: "Resolved",
                                value: resolvedCount,
                                children: [
                                    { name: "Pending for Feedback", value: pendingForFeedbackCount },
                                    { name: "Feedback Submitted", value: feedbackSubmittedCount },
                                ],
                            },
                            { name: "Closed", value: closedCount },
                        ],
                    },
                ],
                radius: [0, "72%"],
                itemStyle: {
                    borderRadius: 5,
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: "{c}",
                },
            },
        };
    }, [data?.statusCounts]);

    const ticketMetricsCardData = useMemo<MetricCardData>(() => {
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
                        { title: { text: "Pending" }, metricValue: { text: String(pendingCount) }, backgroundColor: "background.paper" },
                        { title: { text: "Resolved" }, metricValue: { text: String(resolvedCount) }, backgroundColor: "background.paper" },
                        { title: { text: "Closed" }, metricValue: { text: String(closedCount) }, backgroundColor: "background.paper" },
                    ],
                },
            ],
        };
    }, [data?.statusCounts, data?.totalTickets]);

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

                    <Box display="flex" flexWrap="wrap" gap={4}>
                        <Box flex={1} minWidth={280}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Ticket Lifecycle Distribution
                            </Typography>
                            <ReactECharts option={ticketLifecycleSunburstOptions} style={{ height: 340 }} />
                        </Box>
                        <Box flex={1} minWidth={280}>
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
